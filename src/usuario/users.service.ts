import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}
    
    async criar(CreateUserDto: CreateUserDto) {
        const {email, nome, senha} = CreateUserDto;

        const userExistente = await this.prisma.usuario.findUnique({
            where: {email},
        });

        if (userExistente) {
            throw new ConflictException("E-mail já cadastrado")
        }

        const hashedSenha = await bcrypt.hash(senha, 10);

        const user = await this.prisma.usuario.create({
            data: {
                nome,
                email,
                senha: hashedSenha,
            },
        });
        
        const {senha: _, ...result } = user;
        return result
    }
    async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }
}

