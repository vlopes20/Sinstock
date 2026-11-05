import {
  PermissionResource,
  PermissionsGuard,
} from '../auth/guards/permissions.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FiltroPedidosDto } from './dto/filtro-pedidos.dto';
import { UpdateAtendimentoDto } from './dto/update-atendimento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { PedidosService } from './pedidos.service';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@PermissionResource('pedidos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post('checkout')
  realizarCheckout(
    @Body() dto: CreateCheckoutDto,
    @Req() req: RequestWithUser,
  ) {
    return this.pedidosService.processarCheckout(dto, req.user.userId);
  }

  @Post('reservar')
  criarReserva(@Body() dto: CreateReservaDto, @Req() req: RequestWithUser) {
    return this.pedidosService.criarReserva(dto, req.user.userId);
  }

  @Patch(':id/confirmar')
  confirmarReserva(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.pedidosService.confirmarReserva(id, req.user.userId);
  }

  @Get()
  listarTodos(@Query() dto: FiltroPedidosDto) {
    return this.pedidosService.listarTodos(dto);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.pedidosService.buscarPorId(id);
  }

  @Get('resumo/periodo')
  resumo(@Query() dto: FiltroPedidosDto) {
    return this.pedidosService.resumo(dto);
  }

  @Patch(':id/atendimento')
  atendimento(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAtendimentoDto,
    @Req() req: RequestWithUser,
  ) {
    return this.pedidosService.atualizarAtendimento(
      id,
      dto.atendimento,
      req.user.userId,
    );
  }

  @Patch(':id/cancelar')
  cancelarPedido(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.pedidosService.cancelarPedido(id, req.user.userId);
  }
}
