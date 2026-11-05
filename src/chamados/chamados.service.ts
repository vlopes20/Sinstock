import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Prisma, chamados_suporte_status } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  CriarChamadoDto,
  FaqDto,
  FiltroChamadosDto,
  FiltroFaqDto,
} from './dto/criar-chamado.dto';
export type SupportUser = { userId: number; email: string; perfil_id: number };
const attachmentFields = {
  id: true,
  nome: true,
  mime: true,
  tamanho: true,
  criado_em: true,
} satisfies Prisma.AnexoChamadoSelect;

@Injectable()
export class ChamadosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}
  async criar(dto: CriarChamadoDto, user: SupportUser) {
    const code = 'CHM-' + (dto.request_id || randomUUID());
    let ticket;
    try {
      ticket = await this.prisma.chamados_suporte.create({
        data: {
          codigo: code,
          usuario_id: user.userId,
          email_solicitante: user.email,
          assunto: dto.titulo,
          descricao: dto.descricao,
          prioridade: dto.prioridade,
          categoria: dto.categoria,
          pagina: dto.pagina,
        },
      });
    } catch (error) {
      if (error?.code !== 'P2002' || !dto.request_id) throw error;
      const existing = await this.prisma.chamados_suporte.findFirst({
        where: { codigo: code, usuario_id: user.userId },
      });
      if (!existing)
        throw new BadRequestException(
          'A referência deste chamado já foi utilizada.',
        );
      return { ...existing, email_enviado: false, ja_existente: true };
    }
    const email = await this.mail.enviarEmail({
      para: user.email,
      assunto: '[' + ticket.codigo + '] Chamado registrado',
      conteudoHtml:
        '<p>Seu chamado <strong>' +
        ticket.codigo +
        '</strong> foi registrado no SINSTOCK. Acompanhe as respostas na tela Ajuda.</p>',
    });
    return { ...ticket, email_enviado: email };
  }
  async listarTodos(dto: FiltroChamadosDto, user: SupportUser) {
    const pagina = dto.pagina ?? 1,
      limite = dto.limite ?? 10;
    const where: Prisma.chamados_suporteWhereInput = {
      ...(user.perfil_id === 1 ? {} : { usuario_id: user.userId }),
      status: dto.status,
      ...(dto.busca
        ? {
            OR: [
              { assunto: { contains: dto.busca } },
              { codigo: { contains: dto.busca } },
            ],
          }
        : {}),
    };
    const [total, dados] = await Promise.all([
      this.prisma.chamados_suporte.count({ where }),
      this.prisma.chamados_suporte.findMany({
        where,
        skip: (pagina - 1) * limite,
        take: limite,
        orderBy: { id: 'desc' },
        include: {
          usuarios: { select: { id: true, nome: true } },
          _count: { select: { mensagens: true, anexos: true } },
        },
      }),
    ]);
    return {
      dados,
      meta: { total, pagina, limite, totalPages: Math.ceil(total / limite) },
    };
  }
  async buscarPorId(id: number, user: SupportUser) {
    const ticket = await this.prisma.chamados_suporte.findFirst({
      where: {
        id,
        ...(user.perfil_id === 1 ? {} : { usuario_id: user.userId }),
      },
      include: {
        usuarios: { select: { id: true, nome: true } },
        mensagens: {
          orderBy: { id: 'asc' },
          include: { autor: { select: { id: true, nome: true } } },
        },
        anexos: { select: attachmentFields, orderBy: { criado_em: 'asc' } },
      },
    });
    if (!ticket) throw new NotFoundException('Chamado não encontrado.');
    return ticket;
  }
  async atualizarStatus(
    id: number,
    status: chamados_suporte_status,
    user: SupportUser,
  ) {
    const initial = await this.buscarPorId(id, user);
    if (user.perfil_id !== 1 && !['FECHADO', 'CANCELADO'].includes(status))
      throw new ForbiddenException(
        'Somente a administração pode mudar este status.',
      );
    const ticket = await this.prisma.$transaction(async (tx) => {
      const row = await tx.chamados_suporte.update({
        where: { id },
        data: {
          status,
          data_fechamento: ['FECHADO', 'RESOLVIDO', 'CANCELADO'].includes(
            status,
          )
            ? new Date()
            : null,
        },
      });
      await tx.logAuditoriaEstoque.create({
        data: {
          usuarioId: String(user.userId),
          acao: 'STATUS_CHAMADO',
          recurso: 'CHAMADO',
          recursoId: String(id),
          dadosAnteriores: { status: initial.status },
          dadosNovos: { status },
        },
      });
      return row;
    });
    const email = initial.email_solicitante
      ? await this.mail.enviarEmail({
          para: initial.email_solicitante,
          assunto: '[' + ticket.codigo + '] Atualização do chamado',
          conteudoHtml:
            '<p>O status do chamado <strong>' +
            ticket.codigo +
            '</strong> agora é <strong>' +
            status +
            '</strong>.</p>',
        })
      : false;
    return { ...ticket, email_enviado: email };
  }
  async mensagem(id: number, text: string, user: SupportUser) {
    const ticket = await this.buscarPorId(id, user);
    if (['FECHADO', 'CANCELADO'].includes(ticket.status ?? ''))
      throw new BadRequestException('Este chamado está encerrado.');
    return this.prisma.mensagens_chamado.create({
      data: { chamado_id: id, usuario_id: user.userId, mensagem: text },
      include: { autor: { select: { id: true, nome: true } } },
    });
  }
  async upload(
    id: number,
    file: { originalname: string; buffer: Buffer },
    user: SupportUser,
  ) {
    const ticket = await this.buscarPorId(id, user);
    if (['FECHADO', 'CANCELADO'].includes(ticket.status ?? ''))
      throw new BadRequestException('Este chamado está encerrado.');
    if (!file?.buffer?.length || file.buffer.length > 2 * 1024 * 1024)
      throw new BadRequestException('Envie um arquivo de até 2 MB.');
    const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const mime = file.buffer.subarray(0, 8).equals(png)
      ? 'image/png'
      : file.buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
        ? 'image/jpeg'
        : file.buffer.subarray(0, 5).toString('ascii') === '%PDF-'
          ? 'application/pdf'
          : null;
    if (!mime)
      throw new UnsupportedMediaTypeException('São aceitos PNG, JPEG e PDF.');
    return this.prisma.anexoChamado.create({
      data: {
        chamado_id: id,
        usuario_id: user.userId,
        nome: basename(file.originalname).slice(0, 255),
        mime,
        tamanho: file.buffer.length,
        conteudo: Uint8Array.from(file.buffer),
      },
      select: attachmentFields,
    });
  }
  async attachment(id: string, user: SupportUser) {
    const file = await this.prisma.anexoChamado.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('Anexo não encontrado.');
    await this.buscarPorId(file.chamado_id, user);
    return file;
  }
  async faq(dto: FiltroFaqDto, user: SupportUser) {
    return this.prisma.faq.findMany({
      where: {
        ...(dto.todos && user.perfil_id === 1 ? {} : { ativo: true }),
        ...(dto.busca
          ? {
              OR: [
                { pergunta: { contains: dto.busca } },
                { resposta: { contains: dto.busca } },
              ],
            }
          : {}),
      },
      orderBy: [{ ordem: 'asc' }, { id: 'asc' }],
    });
  }
  saveFaq(id: number | undefined, dto: FaqDto) {
    return id
      ? this.prisma.faq.update({ where: { id }, data: dto })
      : this.prisma.faq.create({ data: dto });
  }
  deleteFaq(id: number) {
    return this.prisma.faq.update({ where: { id }, data: { ativo: false } });
  }
}
