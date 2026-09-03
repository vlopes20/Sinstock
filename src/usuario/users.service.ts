import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const saltRounds = 10;
    const senha_hash = await bcrypt.hash(createUserDto.senha, saltRounds);

    try {
      const user = await this.prisma.usuarios.create({
        data: {
          nome: createUserDto.nome,
          email: createUserDto.email,
          senha_hash,
          perfil_id: createUserDto.perfil_id,
          telefone: createUserDto.telefone,
        },
        select: {
          id: true,
          nome: true,
          email: true,
          perfil_id: true,
          telefone: true,
          ativo: true,
          criado_em: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('O e-mail informado já está em uso.');
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('O perfil_id informado não existe.');
        }
      }
      throw new InternalServerErrorException('Erro ao criar o usuário.');
    }
  }

  async findByEmail(email: string) {
    return this.prisma.usuarios.findUnique({
      where: { email },
    });
  }

  async findAll() {
    return this.prisma.usuarios.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        perfil_id: true,
        telefone: true,
        ativo: true,
        criado_em: true,
        perfis: {
          select: { nome: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.usuarios.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil_id: true,
        telefone: true,
        ativo: true,
        criado_em: true,
        perfis: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }
}