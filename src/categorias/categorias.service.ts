import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CreateCategoriaDto) {
    try {
      return await this.prisma.categorias.create({
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe uma categoria com este nome.');
      }
      throw error;
    }
  }

  async listar() {
    return this.prisma.categorias.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async buscarPorId(id: number) {
    const categoria = await this.prisma.categorias.findUnique({
      where: { id },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada.`);
    }

    return categoria;
  }
}