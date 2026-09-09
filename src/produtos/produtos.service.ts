import {Injectable, NotFoundException, BadRequestException, ConflictException,} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CreateProdutoDto) {
    try {
      return await this.prisma.produtos.create({
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('A categoria informada não existe.');
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Já existe um produto cadastrado com este código de barras.');
        }
      }
      throw error;
    }
  }

  async listar() {
    return this.prisma.produtos.findMany({
      include: {
        categorias: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async buscarPorId(id: number) {
    const produto = await this.prisma.produtos.findUnique({
      where: { id },
      include: {
        categorias: true,
      },
    });

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }

    return produto;
  }

  async atualizar(id: number, dto: UpdateProdutoDto) {
    await this.buscarPorId(id);

    try {
      return await this.prisma.produtos.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('A categoria informada não existe.');
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Já existe um produto cadastrado com este código de barras.');
        }
      }
      throw error;
    }
  }

  async remover(id: number) {
    await this.buscarPorId(id);

    try {
      return await this.prisma.produtos.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException(
          'Não é possível excluir este produto pois existem registros ou movimentações vinculadas a ele.',
        );
      }
      throw error;
    }
  }
}