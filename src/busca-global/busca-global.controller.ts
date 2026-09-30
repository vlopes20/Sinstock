import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BuscaGlobalService } from './busca-global.service';
import { BuscaGlobalDto } from './dto/busca-global.dto';

@ApiTags('Busca Global')
@Controller('busca-global')
export class BuscaGlobalController {
  constructor(private readonly buscaGlobalService: BuscaGlobalService) {}

  @Get()
  @ApiOperation({ summary: 'Realiza pesquisa multi-critério centralizada no sistema' })
  buscar(@Query() query: BuscaGlobalDto) {
    return this.buscaGlobalService.buscar(query);
  }
}