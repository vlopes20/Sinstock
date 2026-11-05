import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ClienteFilterDto } from './dto/cliente-filter.dto';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClienteDto) {
    try {
      return await this.prisma.clientes.create({
        data: {
          nome: dto.nome,
          cpf_cnpj: dto.cpf_cnpj || null,
          telefone: dto.telefone || null,
          email: dto.email || null,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('O e-mail ou CPF/CNPJ informado já está cadastrado.');
        }
      }
      throw new InternalServerErrorException('Erro ao cadastrar o cliente.');
    }
  }

  async findAll(filterDto: ClienteFilterDto) {
    const {
      pagina = 1,
      limite = 10,
      busca,
      ordenar_por = 'criado_em',
      ordem = 'desc',
    } = filterDto;

    const skip = (pagina - 1) * limite;
    const where: Prisma.clientesWhereInput = {};

    if (busca) {
      where.OR = [
        { nome: { contains: busca } },
        { email: { contains: busca } },
        { cpf_cnpj: { contains: busca } },
      ];
    }

    const colunasValidas = ['id', 'nome', 'cpf_cnpj', 'email', 'criado_em'];
    const campoOrdenacao = colunasValidas.includes(ordenar_por)
      ? ordenar_por
      : 'criado_em';

    const [total, data] = await Promise.all([
      this.prisma.clientes.count({ where }),
      this.prisma.clientes.findMany({
        where,
        skip,
        take: limite,
        orderBy: { [campoOrdenacao]: ordem },
      }),
    ]);

    const totalPages = Math.ceil(total / limite);

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limite,
        totalPages,
        currentPage: pagina,
      },
    };
  }

  async findOne(id: number) {
    const cliente = await this.prisma.clientes.findUnique({
      where: { id },
      include: {
        pedidos_venda: {
          take: 5,
          orderBy: { id: 'desc' },
          select: {
            id: true,
            data_venda: true,
            total: true,
            status: true,
          },
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado.`);
    }

    return cliente;
  }

  async update(id: number, dto: UpdateClienteDto) {
    await this.findOne(id);

    try {
      return await this.prisma.clientes.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('O e-mail ou CPF/CNPJ informado já pertence a outro cliente.');
        }
      }
      throw new InternalServerErrorException('Erro ao atualizar o cliente.');
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.clientes.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('Não é possível excluir o cliente pois ele possui pedidos vinculados.');
        }
      }
      throw new InternalServerErrorException('Erro ao excluir o cliente.');
    }
  }
}