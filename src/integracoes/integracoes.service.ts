import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface EnderecoResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
  lat?: string;
  lon?: string;
}

@Injectable()
export class IntegracoesService {
  constructor(private readonly httpService: HttpService) {}

  async buscarPorCep(cepInput: string): Promise<EnderecoResponse> {
    const cepLimpo = cepInput.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      throw new BadRequestException('CEP inválido. Deve conter 8 dígitos.');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`[https://viacep.com.br/ws/$](https://viacep.com.br/ws/$){cepLimpo}/json/`),
      );

      if (response.data?.erro) {
        throw new NotFoundException(`CEP '${cepInput}' não encontrado.`);
      }

      const { cep, logradouro, complemento, bairro, localidade, uf, ibge } = response.data;

      return {
        cep,
        logradouro,
        complemento,
        bairro,
        localidade,
        uf,
        ibge,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao consultar o serviço externo de CEP.');
    }
  }

  // Geocoding básico via Nominatim (OpenStreetMap) para obter Lat/Lon
  async obterCoordenadas(logradouro: string, cidade: string, uf: string) {
    try {
      const query = encodeURIComponent(`${logradouro}, ${cidade} - ${uf}, Brasil`);
      const response = await firstValueFrom(
        this.httpService.get(`[https://nominatim.openstreetmap.org/search?format=json&q=$](https://nominatim.openstreetmap.org/search?format=json&q=$){query}`, {
          headers: { 'User-Agent': 'Sinstock-ERP/1.0' },
        }),
      );

      if (!response.data || response.data.length === 0) {
        return { lat: null, lon: null };
      }

      return {
        lat: response.data[0].lat,
        lon: response.data[0].lon,
      };
    } catch {
      return { lat: null, lon: null };
    }
  }

  // Cálculo de distância em KM entre duas coordenadas (Fórmula de Haversine)
  calcularDistanciaEmKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em KM
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100; // Retorna distância formatada em KM
  }


async calcularDistanciaEntreCeps(
    cepOrigem: string,
    cepDestino: string,
    raioMaximoKm?: number,
  ) {
    // 1. Busca dados do CEP de Origem
    const enderecoOrigem = await this.buscarPorCep(cepOrigem);
    let coordsOrigem = await this.obterCoordenadas(
      enderecoOrigem.logradouro,
      enderecoOrigem.localidade,
      enderecoOrigem.uf,
    );

    // Fallback: busca apenas por cidade/UF caso logradouro não retorne coordenadas
    if (!coordsOrigem.lat || !coordsOrigem.lon) {
      coordsOrigem = await this.obterCoordenadas('', enderecoOrigem.localidade, enderecoOrigem.uf);
    }

    // 2. Busca dados do CEP de Destino
    const enderecoDestino = await this.buscarPorCep(cepDestino);
    let coordsDestino = await this.obterCoordenadas(
      enderecoDestino.logradouro,
      enderecoDestino.localidade,
      enderecoDestino.uf,
    );

    if (!coordsDestino.lat || !coordsDestino.lon) {
      coordsDestino = await this.obterCoordenadas('', enderecoDestino.localidade, enderecoDestino.uf);
    }

    // Valida se foi possível encontrar coordenadas para ambos os pontos
    if (!coordsOrigem.lat || !coordsDestino.lat) {
      throw new BadRequestException('Não foi possível obter a geolocalização de um dos CEPs informados.');
    }

    // 3. Calcula a distância em KM via Haversine
    const distanciaKm = this.calcularDistanciaEmKm(
      Number(coordsOrigem.lat),
      Number(coordsOrigem.lon),
      Number(coordsDestino.lat),
      Number(coordsDestino.lon),
    );

    const dentroDoRaio = raioMaximoKm ? distanciaKm <= raioMaximoKm : undefined;

    return {
      origem: {
        cep: enderecoOrigem.cep,
        cidade: enderecoOrigem.localidade,
        uf: enderecoOrigem.uf,
        lat: coordsOrigem.lat,
        lon: coordsOrigem.lon,
      },
      destino: {
        cep: enderecoDestino.cep,
        cidade: enderecoDestino.localidade,
        uf: enderecoDestino.uf,
        lat: coordsDestino.lat,
        lon: coordsDestino.lon,
      },
      distancia_km: distanciaKm,
      ...(raioMaximoKm !== undefined && {
        raio_maximo_km: raioMaximoKm,
        dentro_do_raio: dentroDoRaio,
      }),
    };
  }
}