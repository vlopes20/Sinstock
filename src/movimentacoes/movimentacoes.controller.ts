import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MovimentacoesService } from './movimentacoes.service';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';

@ApiTags('Movimentações de Estoque')
@Controller('movimentacoes')
export class MovimentacoesController {
  constructor(private readonly movimentacoesService: MovimentacoesService) {}

  @Post()
  @ApiOperation({
    summary: 'Registra movimentação de estoque (ENTRADA, SAIDA ou AJUSTE)',
  })
  registrarMovimentacao(@Body() dto: CreateMovimentacaoDto) {
    // ID do usuário logado (fixado temporariamente em 1 até a integração do JWT)
    const usuarioId = 1;
    return this.movimentacoesService.registrarMovimentacao(dto, usuarioId);
  }

  @Post('transferencia')
  @ApiOperation({
    summary: 'Realiza a transferência de estoque entre duas filiais',
  })
  transferirSaldo(@Body() dto: CreateTransferenciaDto) {
    const usuarioId = 1;
    return this.movimentacoesService.transferirSaldo(dto, usuarioId);
  }

  @Get('historico')
  @ApiOperation({
    summary: 'Lista o histórico de movimentações com filtros opcionais',
  })
  @ApiQuery({ name: 'filial_id', required: false, type: Number })
  @ApiQuery({ name: 'produto_id', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listarHistorico(
    @Query('filial_id') filialId?: number,
    @Query('produto_id') produtoId?: number,
    @Query('limit') limit?: number,
  ) {
    return this.movimentacoesService.listarHistorico(
      filialId ? Number(filialId) : undefined,
      produtoId ? Number(produtoId) : undefined,
      limit ? Number(limit) : 50,
    );
  }
}