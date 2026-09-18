import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AjusteLoteDto } from './dto/ajuste-lote.dto';
import { CreateNotaFiscalEntradaDto } from './dto/create-nota-fiscal-entrada.dto';
import { EstornoNotaFiscalDto } from './dto/estorno-nota-fiscal.dto';
import { NotasFiscaisEntradaService } from './notas-fiscais-entrada.service';

@Controller('notas-fiscais-entrada')
export class NotasFiscaisEntradaController {
  constructor(private readonly service: NotasFiscaisEntradaService) {}

  @Post()
  criar(@Body() dto: CreateNotaFiscalEntradaDto) {
    return this.service.criar(dto);
  }

  @Get()
  listar() {
    return this.service.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscarPorId(id);
  }

  @Patch(':id/estorno')
  estornar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EstornoNotaFiscalDto,
  ) {
    return this.service.estornar(id, dto);
  }

  @Patch('lotes/:loteId')
  ajustarLote(
    @Param('loteId', ParseIntPipe) loteId: number,
    @Body() dto: AjusteLoteDto,
  ) {
    return this.service.ajustarLote(loteId, dto);
  }
}