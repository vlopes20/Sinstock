import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CreateProdutoDto) {
    return this.prisma.produtos.create({
      data: {
        categoria_id: dto.categoria_id,
        nome: dto.nome,
        marca: dto.marca,
        codigo_barras: dto.codigo_barras,
        estoque_minimo: dto.estoque_minimo,
        preco_venda: dto.preco_venda,
        custo_medio: dto.custo_medio,
      },
    });
  }

  async listar() {
    return this.prisma.produtos.findMany();
  }

  async buscarPorId(id: number) {
    return this.prisma.produtos.findUnique({
      where: {id},
    });
  }

  async atualizar(id: number, dto: UpdateProdutoDto) {
    return this.prisma.produtos.update({
      where: {id},
      data: dto,
    });
  }

  async remover(id: number) {
    return this.prisma.produtos.delete({
      where: {id},
    });
  }
}