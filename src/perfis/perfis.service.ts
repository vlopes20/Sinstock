import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePerfilDto } from './dto/create-perfil.dto';

@Injectable()
export class PerfisService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPerfilDto: CreatePerfilDto) {
    return this.prisma.perfis.create({
      data: {
        nome: createPerfilDto.nome,
        permissoes: createPerfilDto.permissoes,
      },
    });
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
      include: { usuarios: true },
    });

    if (!perfil) {
      throw new NotFoundException(`Perfil com ID ${id} não encontrado`);
    }

    return perfil;
  }
}