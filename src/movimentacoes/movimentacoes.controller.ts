import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { MovimentacoesService } from './movimentacoes.service';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('movimentacoes')
export class MovimentacoesController {
  constructor(private readonly movimentacoesService: MovimentacoesService) {}

  @Post()
  registrar(@Body() dto: CreateMovimentacaoDto, @Req() req: RequestWithUser) {
    const usuarioId = req.user.userId;
    
    return this.movimentacoesService.registrarMovimentacao(dto, usuarioId);
  }

  @Post('transferencia')
  transferir(@Body() dto: CreateTransferenciaDto, @Req() req: RequestWithUser) {
    const usuarioId = req.user.userId;

    return this.movimentacoesService.transferirSaldo(dto, usuarioId);
  }
}