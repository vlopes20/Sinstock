import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { PedidosService } from './pedidos.service';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post('checkout')
  realizarCheckout(@Body() dto: CreateCheckoutDto, @Req() req: RequestWithUser) {
    const usuarioId = req.user.userId;
    
    return this.pedidosService.processarCheckout(dto, usuarioId);
  }
}