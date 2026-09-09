import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFilialDto } from './dto/create-filial.dto';

@Injectable()
export class FiliaisService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFilialDto) {
    try {
      return await this.prisma.filiais.create({ data: dto });
    } catch (error) {
      throw new InternalServerErrorException('Erro ao criar filial.');
    }
  }

  async findAll() {
    return this.prisma.filiais.findMany({
      select: {
        id: true,
        nome: true,
        endereco: true,
        criado_em: true,
        _count: { select: { saldos_estoque: true } },
      },
    });
  }

  async findOne(id: number) {
    const filial = await this.prisma.filiais.findUnique({
      where: { id },
      include: { 
        saldos_estoque: {
          include: {
            produtos: { select: { nome: true } }
          }
        } 
      },
    });

    if (!filial) {
      throw new NotFoundException(`Filial com ID ${id} não encontrada.`);
    }

    return filial;
  }

  async update(id: number, dto: Partial<CreateFilialDto>) {
    try {
      return await this.prisma.filiais.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Filial com ID ${id} não encontrada.`);
      }
      throw new InternalServerErrorException('Erro ao atualizar filial.');
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.filiais.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Filial com ID ${id} não encontrada.`);
      }
      throw new InternalServerErrorException('Erro ao excluir filial. Verifique se não há estoques vinculados a ela.');
    }
  }
}