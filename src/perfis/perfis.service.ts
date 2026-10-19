import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePerfilDto } from './dto/create-perfil.dto';

@Injectable()
export class PerfisService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPerfilDto: CreatePerfilDto) {
    try {
      return await this.prisma.perfis.create({
        data: {
          nome: createPerfilDto.nome,
          permissoes: createPerfilDto.permissoes,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Já existe um perfil cadastrado com este nome.');
      }
      throw new InternalServerErrorException('Erro ao criar o perfil.');
    }
  }

  async findAll() {
    return this.prisma.perfis.findMany({
      include: {
        _count: {
          select: { usuarios: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const perfil = await this.prisma.perfis.findUnique({
      where: { id },
      include: {
        usuarios: {
          select: {
            id: true,
            nome: true,
            email: true,
            ativo: true,
          },
        },
      },
    });

    if (!perfil) {
      throw new NotFoundException(`Perfil com ID ${id} não encontrado`);
    }

    return perfil;
  }
}