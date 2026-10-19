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
import { chamados_suporte_status } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChamadosService } from './chamados.service';
import { CriarChamadoDto } from './dto/criar-chamado.dto';

@ApiTags('Chamados')
@Controller('chamados')
export class ChamadosController {
  constructor(private readonly chamadosService: ChamadosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo chamado de suporte (Aberto)' })
  criar(@Body() criarChamadoDto: CriarChamadoDto) {
    return this.chamadosService.criar(criarChamadoDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar todos os chamados' })
  listarTodos() {
    return this.chamadosService.listarTodos();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buscar chamado por ID' })
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.chamadosService.buscarPorId(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar o status de um chamado' })
  atualizarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: chamados_suporte_status,
  ) {
    return this.chamadosService.atualizarStatus(id, status);
  }
}