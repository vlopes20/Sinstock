import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@ApiTags('Categorias')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra uma nova categoria' })
  criar(@Body() dto: CreateCategoriaDto) {
    return this.categoriasService.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as categorias' })
  listar() {
    return this.categoriasService.listar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca categoria por ID' })
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.buscarPorId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de uma categoria' })
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.atualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma categoria' })
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.remover(id);
  }
}