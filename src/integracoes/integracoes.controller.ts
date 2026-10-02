import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IntegracoesService } from './integracoes.service';
import { ConsultaCepDto } from './dto/consulta-cep.dto';
import { ConsultaCoordenadasDto } from './dto/consulta-coordenadas.dto';
import { ConsultaDistanciaCepsDto } from './dto/consulta-distancia-ceps.dto';

@ApiTags('Integrações Externas (CEP e Mapas)')
@Controller('integracoes')
export class IntegracoesController {
  constructor(private readonly integracoesService: IntegracoesService) {}

  @Get('cep/:cep')
  @ApiOperation({ summary: 'Busca endereço completo a partir do CEP (ViaCEP)' })
  buscarPorCep(@Param() params: ConsultaCepDto) {
    return this.integracoesService.buscarPorCep(params.cep);
  }

  @Get('coordenadas')
  @ApiOperation({ summary: 'Obtém latitude e longitude de um endereço (Nominatim/OSM)' })
  obterCoordenadas(@Query() query: ConsultaCoordenadasDto) {
    return this.integracoesService.obterCoordenadas(
      query.logradouro,
      query.cidade,
      query.uf,
    );
  }

  @Get('distancia-ceps')
  @ApiOperation({ summary: 'Calcula a distância e raio limite em KM entre dois CEPs' })
  calcularDistanciaCeps(@Query() query: ConsultaDistanciaCepsDto) {
    return this.integracoesService.calcularDistanciaEntreCeps(
      query.cep_origem,
      query.cep_destino,
      query.raio_maximo_km,
    );
  }
}