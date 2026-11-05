import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
          email: createUserDto.email.trim().toLowerCase(),
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

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findById(id);

    const dataToUpdate: Prisma.usuariosUpdateInput = {};

    if (updateUserDto.nome !== undefined)
      dataToUpdate.nome = updateUserDto.nome;
    if (updateUserDto.email !== undefined)
      dataToUpdate.email = updateUserDto.email.trim().toLowerCase();
    if (updateUserDto.perfil_id !== undefined) {
      dataToUpdate.perfis = { connect: { id: updateUserDto.perfil_id } };
    }
    if (updateUserDto.telefone !== undefined)
      dataToUpdate.telefone = updateUserDto.telefone;
    if (updateUserDto.ativo !== undefined)
      dataToUpdate.ativo = updateUserDto.ativo;
    if (
      updateUserDto.ativo !== undefined ||
      updateUserDto.perfil_id !== undefined ||
      updateUserDto.email !== undefined
    )
      dataToUpdate.auth_version = { increment: 1 };

    if (updateUserDto.senha) {
      const saltRounds = 10;
      dataToUpdate.senha_hash = await bcrypt.hash(
        updateUserDto.senha,
        saltRounds,
      );
      dataToUpdate.auth_version = { increment: 1 };
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (
          updateUserDto.ativo !== undefined ||
          updateUserDto.perfil_id !== undefined
        ) {
          const admins = await tx.$queryRaw<{ id: number }[]>(
            Prisma.sql`SELECT id FROM usuarios WHERE perfil_id = 1 AND ativo = true ORDER BY id FOR UPDATE`,
          );
          if (
            admins.length === 1 &&
            admins[0].id === id &&
            (updateUserDto.ativo === false ||
              (updateUserDto.perfil_id !== undefined &&
                updateUserDto.perfil_id !== 1))
          )
            throw new BadRequestException(
              'Mantenha pelo menos um administrador ativo.',
            );
        }
        return tx.usuarios.update({
          where: { id },
          data: dataToUpdate,
          select: {
            id: true,
            nome: true,
            email: true,
            perfil_id: true,
            telefone: true,
            ativo: true,
            criado_em: true,
            atualizado_em: true,
            perfis: { select: { id: true, nome: true, permissoes: true } },
          },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('O e-mail informado já está em uso.');
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('O perfil_id informado não existe.');
        }
      }
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Erro ao atualizar o usuário.');
    }
  }

  async toggleStatus(id: number) {
    const user = await this.findById(id);
    return this.update(id, { ativo: !user.ativo });
  }

  async findByEmail(email: string) {
    return this.prisma.usuarios.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        senha_hash: true,
        auth_version: true,
        perfil_id: true,
        telefone: true,
        ativo: true,
        criado_em: true,
        atualizado_em: true,
        token_2fa: true,
        token_expiracao: true,
        twoFactorSecret: true,
        isTwoFactorEnable: true,
        two_factor_method: true,
        ultimo_acesso: true,
        preferencias: true,
        perfis: {
          select: {
            id: true,
            nome: true,
            permissoes: true,
          },
        },
      },
    });
  }

  async revokeSessions(id: number) {
    await this.prisma.usuarios.update({
      where: { id },
      data: { auth_version: { increment: 1 } },
    });
  }

  async findById(id: number) {
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
        atualizado_em: true,
        isTwoFactorEnable: true,
        perfis: {
          select: {
            id: true,
            nome: true,
            permissoes: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    return user;
  }

  async findOne(id: number) {
    return this.findById(id);
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
        isTwoFactorEnable: true,
        ultimo_acesso: true,
        perfis: {
          select: { id: true, nome: true },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async setTwoFactorSecret(id: number, secret: string) {
    return this.prisma.usuarios.update({
      where: { id },
      data: {
        twoFactorSecret: secret,
      },
    });
  }

  async enableTwoFactor(id: number) {
    return this.prisma.usuarios.update({
      where: { id },
      data: {
        isTwoFactorEnable: true,
        two_factor_method: 'TOTP',
        auth_version: { increment: 1 },
      },
    });
  }

  async findByIdWithSecrets(id: number) {
    const user = await this.prisma.usuarios.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        perfil_id: true,
        ativo: true,
        criado_em: true,
        atualizado_em: true,
        senha_hash: true,
        auth_version: true,
        twoFactorSecret: true,
        isTwoFactorEnable: true,
        two_factor_method: true,
        ultimo_acesso: true,
        preferencias: true,
        token_2fa: true,
        token_expiracao: true,
        perfis: {
          select: {
            id: true,
            nome: true,
            permissoes: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    return user;
  }
}
