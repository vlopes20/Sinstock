import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AjusteLoteDto } from './dto/ajuste-lote.dto';
import { CreateNotaFiscalEntradaDto } from './dto/create-nota-fiscal-entrada.dto';
import { EstornoNotaFiscalDto } from './dto/estorno-nota-fiscal.dto';
import { NotasFiscaisEntradaService } from './notas-fiscais-entrada.service';

@ApiTags('Notas Fiscais de Entrada')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notas-fiscais-entrada')
export class NotasFiscaisEntradaController {
  constructor(private readonly service: NotasFiscaisEntradaService) {}

  @Post()
  @ApiOperation({ summary: 'Lança uma nova Nota Fiscal de Entrada' })
  criar(@Body() dto: CreateNotaFiscalEntradaDto) {
    return this.service.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as Notas Fiscais de Entrada' })
  listar() {
    return this.service.listar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca os detalhes de uma Nota Fiscal de Entrada por ID' })
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscarPorId(id);
  }

  @Patch(':id/estorno')
  @ApiOperation({ summary: 'Realiza o estorno de uma Nota Fiscal de Entrada' })
  estornar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EstornoNotaFiscalDto,
  ) {
    return this.service.estornar(id, dto);
  }

  @Patch('lotes/:loteId')
  @ApiOperation({ summary: 'Ajusta dados de um lote e seu item de entrada' })
  ajustarLote(
    @Param('loteId', ParseIntPipe) loteId: number,
    @Body() dto: AjusteLoteDto,
  ) {
    return this.service.ajustarLote(loteId, dto);
  }
}