import { ConflictException, BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(createUserDto: CreateUserDto) {
    const { email, nome, senha, perfil_id, telefone } = createUserDto;

    const userExistente = await this.prisma.usuarios.findUnique({
      where: { email },
    });

    if (userExistente) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const hashedSenha = await bcrypt.hash(senha, 10);

    try {
      const user = await this.prisma.usuarios.create({
        data: {
          nome,
          email,
          senha_hash: hashedSenha,
          perfil_id,
          telefone,
        },
      });

      const { senha_hash: _, ...result } = user;
      return result;
    } catch (error) {
   
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException('O perfil_id informado não existe no banco de dados.');
      }

      throw new InternalServerErrorException('Erro ao criar usuário no banco de dados');
    }
  }

  async findByEmail(email: string) {
    return this.prisma.usuarios.findUnique({
      where: { email },
    });
  }
}