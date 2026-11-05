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
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { FiltroProdutosDto } from './dto/filtro-produtos.dto';
import { BuscaCodigoBarrasDto } from './dto/busca-codigo-barras.dto';

@ApiTags('Produtos')
@ApiBearerAuth('JWT-auth')
@PermissionResource('produtos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo produto' })
  criar(@Body() dto: CreateProdutoDto) {
    return this.produtosService.criar(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listagem de produtos com filtros dinâmicos e paginação',
  })
  listar(@Query() query: FiltroProdutosDto) {
    return this.produtosService.listar(query);
  }

  @Get('codigo-barras/:codigo')
  @ApiOperation({ summary: 'Busca expressa de produto por código de barras' })
  buscarPorCodigoBarras(
    @Param('codigo') codigo: string,
    @Query() query: BuscaCodigoBarrasDto,
  ) {
    return this.produtosService.buscarPorCodigoBarras(codigo, query.filial_id);
  }

  @Get('resumo')
  resumo() {
    return this.produtosService.resumo();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um produto pelo ID' })
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.buscarPorId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um produto' })
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProdutoDto,
  ) {
    return this.produtosService.atualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um produto do sistema' })
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.remover(id);
  }
}
