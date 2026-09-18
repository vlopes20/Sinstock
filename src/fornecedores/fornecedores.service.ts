import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';

@Injectable()
export class FornecedoresService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CreateFornecedorDto) {
    const existeCnpj = await this.prisma.fornecedores.findUnique({
      where: { cnpj: dto.cnpj },
    });

    if (existeCnpj) {
      throw new ConflictException(`O CNPJ ${dto.cnpj} já está cadastrado.`);
    }

    return this.prisma.fornecedores.create({
      data: dto,
    });
  }

  async listar() {
    return this.prisma.fornecedores.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async buscarPorId(id: number) {
    const fornecedor = await this.prisma.fornecedores.findUnique({
      where: { id },
    });

    if (!fornecedor) {
      throw new NotFoundException(`Fornecedor com ID ${id} não encontrado.`);
    }

    return fornecedor;
  }

  async atualizar(id: number, dto: UpdateFornecedorDto) {
    await this.buscarPorId(id);

    if (dto.cnpj) {
      const existeCnpj = await this.prisma.fornecedores.findUnique({
        where: { cnpj: dto.cnpj },
      });

      if (existeCnpj && existeCnpj.id !== id) {
        throw new ConflictException(`O CNPJ ${dto.cnpj} já pertence a outro fornecedor.`);
      }
    }

    return this.prisma.fornecedores.update({
      where: { id },
      data: dto,
    });
  }

  async remover(id: number) {
    await this.buscarPorId(id);

    return this.prisma.fornecedores.delete({
      where: { id },
    });
  }
}