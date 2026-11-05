import {
  PermissionResource,
  PermissionsGuard,
} from '../auth/guards/permissions.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Ajuste o caminho do guard se necessário
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { MovimentacoesService } from './movimentacoes.service';
import { HistoricoMovimentacoesDto } from './dto/historico-movimentacoes.dto';

interface RequestWithUser extends ExpressRequest {
  user: {
    userId: number;
    email: string;
  };
}

@ApiTags('Movimentações de Estoque')
@ApiBearerAuth('JWT-auth')
@PermissionResource('movimentacoes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('movimentacoes')
export class MovimentacoesController {
  constructor(private readonly movimentacoesService: MovimentacoesService) {}

  @Post()
  @ApiOperation({
    summary: 'Registra movimentação de estoque (ENTRADA, SAIDA ou AJUSTE)',
  })
  registrarMovimentacao(
    @Body() dto: CreateMovimentacaoDto,
    @Request() req: RequestWithUser,
  ) {
    const usuarioId = req.user.userId;
    return this.movimentacoesService.registrarMovimentacao(dto, usuarioId);
  }

  @Post('transferencia')
  @ApiOperation({
    summary: 'Realiza a transferência de estoque entre duas filiais',
  })
  transferirSaldo(
    @Body() dto: CreateTransferenciaDto,
    @Request() req: RequestWithUser,
  ) {
    const usuarioId = req.user.userId;
    return this.movimentacoesService.transferirSaldo(dto, usuarioId);
  }

  @Get('historico')
  @ApiOperation({
    summary: 'Lista o histórico de movimentações com filtros opcionais',
  })
  @ApiQuery({ name: 'filial_id', required: false, type: Number })
  @ApiQuery({ name: 'produto_id', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listarHistorico(@Query() dto: HistoricoMovimentacoesDto) {
    return this.movimentacoesService.listarHistorico(dto);
  }
}
