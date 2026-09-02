import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  criar(@Body() dto: CreateProdutoDto) {
    return this.produtosService.criar(dto);
  }

  @Get()
  listar() {
    return this.produtosService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.produtosService.buscarPorId(Number(id));
  }

  @Patch(':id')
  atualizar(
    @Param('id') id: string,
    @Body() dto: UpdateProdutoDto,
  ) {
    return this.produtosService.atualizar(Number(id), dto);
  }

  @Delete(':id')
  remover(@Param('id') id: string) {
    return this.produtosService.remover(Number(id));
  }
}