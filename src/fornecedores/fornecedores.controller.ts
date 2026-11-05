import {
  PermissionResource,
  PermissionsGuard,
} from '../auth/guards/permissions.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
import { FornecedoresService } from './fornecedores.service';
import { FiltroFornecedoresDto } from './dto/filtro-fornecedores.dto';
import { ProximosFornecedoresDto } from './dto/proximos-fornecedores.dto';

@ApiTags('Fornecedores')
@ApiBearerAuth('JWT-auth')
@PermissionResource('fornecedores')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('fornecedores')
export class FornecedoresController {
  constructor(private readonly fornecedoresService: FornecedoresService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo fornecedor' })
  criar(@Body() dto: CreateFornecedorDto) {
    return this.fornecedoresService.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os fornecedores' })
  listar(@Query() dto: FiltroFornecedoresDto) {
    return this.fornecedoresService.listar(dto);
  }

  @Get('resumo')
  resumo() {
    return this.fornecedoresService.resumo();
  }

  @Get('proximos')
  proximos(@Query() dto: ProximosFornecedoresDto) {
    return this.fornecedoresService.proximos(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca fornecedor por ID' })
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.fornecedoresService.buscarPorId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados de um fornecedor' })
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFornecedorDto,
  ) {
    return this.fornecedoresService.atualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um fornecedor' })
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.fornecedoresService.remover(id);
  }
}
