import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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
  private geocodeQueue: Promise<unknown> = Promise.resolve();
  private lastGeocode = 0;
  private readonly geocodeCache = new Map<
    string,
    { expires: number; value: { lat: string | null; lon: string | null } }
  >();
  private readonly pendingGeocodes = new Map<
    string,
    Promise<{ lat: string | null; lon: string | null }>
  >();

  async buscarPorCep(cepInput: string): Promise<EnderecoResponse> {
    const cepLimpo = cepInput.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      throw new BadRequestException('CEP inválido. Deve conter 8 dígitos.');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://viacep.com.br/ws/${cepLimpo}/json/`),
      );

      if (response.data?.erro) {
        throw new NotFoundException(`CEP '${cepInput}' não encontrado.`);
      }

      const { cep, logradouro, complemento, bairro, localidade, uf, ibge } =
        response.data;

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
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Erro ao consultar o serviço externo de CEP.',
      );
    }
  }

  async obterCoordenadas(logradouro: string, cidade: string, uf: string) {
    const key = [logradouro, cidade, uf]
      .join('|')
      .trim()
      .toLocaleLowerCase('pt-BR');
    const cached = this.geocodeCache.get(key);
    if (cached && cached.expires > Date.now()) return cached.value;
    if (this.pendingGeocodes.has(key)) return this.pendingGeocodes.get(key)!;
    if (this.pendingGeocodes.size >= 5)
      throw new BadRequestException(
        'A busca de endereços está ocupada. Tente novamente em alguns segundos.',
      );
    const task = this.geocodeQueue.then(async () => {
      const wait = Math.max(0, 1100 - (Date.now() - this.lastGeocode));
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
      this.lastGeocode = Date.now();
      return this.fetchCoordinates(logradouro, cidade, uf);
    });
    this.geocodeQueue = task.catch(() => undefined);
    this.pendingGeocodes.set(key, task);
    try {
      const value = await task;
      if (value.lat && value.lon) {
        if (this.geocodeCache.size >= 1000)
          this.geocodeCache.delete(this.geocodeCache.keys().next().value!);
        this.geocodeCache.set(key, {
          expires: Date.now() + 7 * 86400000,
          value,
        });
      }
      return value;
    } finally {
      this.pendingGeocodes.delete(key);
    }
  }

  private async fetchCoordinates(
    logradouro: string,
    cidade: string,
    uf: string,
  ) {
    try {
      const enderecoFormatado = logradouro.trim()
        ? `${logradouro}, ${cidade}, ${uf}, Brasil`
        : `${cidade}, ${uf}, Brasil`;

      const query = encodeURIComponent(enderecoFormatado);
      const response = await firstValueFrom(
        this.httpService.get(
          `${(process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org').replace(/\/$/, '')}/search?format=json&limit=1&q=${query}`,
          {
            headers: { 'User-Agent': 'Sinstock-ERP/1.0' },
          },
        ),
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

  calcularDistanciaEmKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  async calcularDistanciaEntreCeps(
    cepOrigem: string,
    cepDestino: string,
    raioMaximoKm?: number,
  ) {
    const enderecoOrigem = await this.buscarPorCep(cepOrigem);
    let coordsOrigem = await this.obterCoordenadas(
      enderecoOrigem.logradouro,
      enderecoOrigem.localidade,
      enderecoOrigem.uf,
    );

    if (!coordsOrigem.lat || !coordsOrigem.lon) {
      coordsOrigem = await this.obterCoordenadas(
        '',
        enderecoOrigem.localidade,
        enderecoOrigem.uf,
      );
    }

    const enderecoDestino = await this.buscarPorCep(cepDestino);
    let coordsDestino = await this.obterCoordenadas(
      enderecoDestino.logradouro,
      enderecoDestino.localidade,
      enderecoDestino.uf,
    );

    if (!coordsDestino.lat || !coordsDestino.lon) {
      coordsDestino = await this.obterCoordenadas(
        '',
        enderecoDestino.localidade,
        enderecoDestino.uf,
      );
    }

    if (!coordsOrigem.lat || !coordsDestino.lat) {
      throw new BadRequestException(
        'Não foi possível obter a geolocalização de um dos CEPs informados.',
      );
    }

    const distanciaKm = this.calcularDistanciaEmKm(
      Number(coordsOrigem.lat),
      Number(coordsOrigem.lon),
      Number(coordsDestino.lat),
      Number(coordsDestino.lon),
    );

    const dentroDoRaio =
      raioMaximoKm !== undefined ? distanciaKm <= raioMaximoKm : undefined;

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
