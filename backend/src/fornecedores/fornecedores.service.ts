import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';
import { FiltroFornecedoresDto } from './dto/filtro-fornecedores.dto';
import { ProximosFornecedoresDto } from './dto/proximos-fornecedores.dto';
import { BadRequestException } from '@nestjs/common';
@Injectable()
export class FornecedoresService {
  constructor(private readonly prisma: PrismaService) {}
  criar(dto: CreateFornecedorDto) {
    return this.prisma.fornecedores.create({ data: dto });
  }
  async listar(dto = new FiltroFornecedoresDto()) {
    const pagina = dto.pagina ?? 1,
      limite = dto.limite ?? 10;
    const where: Prisma.fornecedoresWhereInput = {
      ativo: dto.ativo,
      categoria: dto.categoria,
      ...(dto.cidade ? { cidade: { contains: dto.cidade } } : {}),
      ...(dto.busca
        ? {
            OR: [
              { nome_juridico: { contains: dto.busca } },
              { nome_fantasia: { contains: dto.busca } },
              { cnpj: { contains: dto.busca.replace(/[.\/-]/g, '') } },
              { contato: { contains: dto.busca } },
              { email: { contains: dto.busca } },
              { cidade: { contains: dto.busca } },
            ],
          }
        : {}),
    };
    const [total, dados] = await Promise.all([
      this.prisma.fornecedores.count({ where }),
      this.prisma.fornecedores.findMany({
        where,
        skip: (pagina - 1) * limite,
        take: limite,
        orderBy: { nome_juridico: 'asc' },
      }),
    ]);
    return {
      dados,
      meta: { total, pagina, limite, totalPages: Math.ceil(total / limite) },
    };
  }
  async resumo() {
    const [total, ativos, pendentes, localizados] = await Promise.all([
      this.prisma.fornecedores.count(),
      this.prisma.fornecedores.count({ where: { ativo: true } }),
      this.prisma.notas_fiscais_entrada.count({
        where: { status: 'PENDENTE' },
      }),
      this.prisma.fornecedores.count({
        where: { latitude: { not: null }, longitude: { not: null } },
      }),
    ]);
    return { total, ativos, pendentes, localizados };
  }
  async proximos(dto: ProximosFornecedoresDto) {
    const pagina = dto.pagina ?? 1,
      limite = dto.limite ?? 10;
    if ((dto.latitude === undefined) !== (dto.longitude === undefined))
      throw new BadRequestException('Informe latitude e longitude juntas.');
    if (dto.latitude === undefined) {
      if (!dto.cidade && !dto.cep)
        throw new BadRequestException(
          'Informe sua localização, cidade ou CEP.',
        );
      const cep = dto.cep?.replace(/\D/g, '');
      const where: Prisma.fornecedoresWhereInput = {
        ativo: true,
        ...(dto.cidade ? { cidade: { contains: dto.cidade } } : {}),
        ...(cep
          ? { cep: { in: [cep, cep.slice(0, 5) + '-' + cep.slice(5)] } }
          : {}),
      };
      const [total, dados] = await Promise.all([
        this.prisma.fornecedores.count({ where }),
        this.prisma.fornecedores.findMany({
          where,
          skip: (pagina - 1) * limite,
          take: limite,
          orderBy: { nome_juridico: 'asc' },
        }),
      ]);
      return {
        modo: 'localidade',
        dados: dados.map((row) => ({ ...row, distancia_km: null })),
        meta: { total, pagina, limite, totalPages: Math.ceil(total / limite) },
      };
    }
    const query = Prisma.sql`SELECT f.*, 6371 * 2 * ASIN(SQRT(LEAST(1,
      POWER(SIN(RADIANS(f.latitude - ${dto.latitude}) / 2), 2) +
      COS(RADIANS(${dto.latitude})) * COS(RADIANS(f.latitude)) * POWER(SIN(RADIANS(f.longitude - ${dto.longitude!}) / 2), 2)
    ))) AS distancia_km FROM fornecedores f WHERE f.ativo = true AND f.latitude IS NOT NULL AND f.longitude IS NOT NULL`;
    const [count, dados, missing] = await Promise.all([
      this.prisma.$queryRaw<{ total: bigint }[]>(
        Prisma.sql`SELECT COUNT(*) AS total FROM (${query}) nearby WHERE distancia_km <= ${dto.raio_km}`,
      ),
      this.prisma.$queryRaw<Record<string, unknown>[]>(
        Prisma.sql`SELECT * FROM (${query}) nearby WHERE distancia_km <= ${dto.raio_km} ORDER BY distancia_km, nome_juridico LIMIT ${limite} OFFSET ${(pagina - 1) * limite}`,
      ),
      this.prisma.fornecedores.count({
        where: { ativo: true, OR: [{ latitude: null }, { longitude: null }] },
      }),
    ]);
    const total = Number(count[0].total);
    return {
      modo: 'distancia',
      sem_coordenadas: missing,
      dados,
      meta: { total, pagina, limite, totalPages: Math.ceil(total / limite) },
    };
  }
  async buscarPorId(id: number) {
    const item = await this.prisma.fornecedores.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Fornecedor não encontrado.');
    return item;
  }
  async atualizar(id: number, dto: UpdateFornecedorDto) {
    await this.buscarPorId(id);
    return this.prisma.fornecedores.update({ where: { id }, data: dto });
  }
  async remover(id: number) {
    await this.buscarPorId(id);
    return this.prisma.fornecedores.delete({ where: { id } });
  }
}
