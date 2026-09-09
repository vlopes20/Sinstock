import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
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

  async atualizar(id: number, dto: UpdateCategoriaDto) {
    await this.buscarPorId(id); 

    try {
      return await this.prisma.categorias.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe uma categoria cadastrada com este nome.');
      }
      throw error;
    }
  }

  async remover(id: number) {
    await this.buscarPorId(id); 

    try {
      return await this.prisma.categorias.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException('Não é possível excluir esta categoria pois existem produtos vinculados a ela.');
      }
      throw error;
    }
  }
}