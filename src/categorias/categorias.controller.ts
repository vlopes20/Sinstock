import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  criar(@Body() dto: CreateCategoriaDto) {
    return this.categoriasService.criar(dto);
  }

  @Get()
  listar() {
    return this.categoriasService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.buscarPorId(id);
  }
}