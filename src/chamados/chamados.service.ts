import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CriarChamadoDto } from './dto/criar-chamado.dto';
import { chamados_suporte_status, chamados_suporte_prioridade } from '@prisma/client';

@Injectable()
export class ChamadosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async criar(dto: CriarChamadoDto) {
    const codigo = `CHM-${Math.floor(1000 + Math.random() * 9000)}`;

    const chamado = await this.prisma.chamados_suporte.create({
      data: {
        codigo,
        assunto: dto.titulo, // Mapeado para a coluna 'assunto' do MySQL
        descricao: dto.descricao,
        prioridade: dto.prioridade as chamados_suporte_prioridade,
        email_solicitante: dto.emailSolicitante, // Mapeado para 'email_solicitante'
      },
    });

    if (chamado.email_solicitante) {
      this.mailService.enviarEmail({
        para: chamado.email_solicitante,
        assunto: `[${chamado.codigo}] Chamado Aberto: ${chamado.assunto}`,
        conteudoHtml: `<p>O seu chamado <strong>${chamado.codigo}</strong> foi registado com sucesso!</p>`,
      });
    }

    return chamado;
  }

  async listarTodos() {
    return this.prisma.chamados_suporte.findMany({
      orderBy: { data_abertura: 'desc' },
    });
  }

  async atualizarStatus(id: number, status: chamados_suporte_status) {
    const chamadoExiste = await this.prisma.chamados_suporte.findUnique({
      where: { id },
    });

    if (!chamadoExiste) {
      throw new NotFoundException(`Chamado com ID "${id}" não foi encontrado.`);
    }

    const chamadoAtualizado = await this.prisma.chamados_suporte.update({
      where: { id },
      data: { status },
    });

    if (chamadoAtualizado.email_solicitante) {
      this.mailService.enviarEmail({
        para: chamadoAtualizado.email_solicitante,
        assunto: `[${chamadoAtualizado.codigo}] Atualização: ${status}`,
        conteudoHtml: `<p>O estado do seu chamado foi alterado para <strong>${status}</strong>.</p>`,
      });
    }

    return chamadoAtualizado;
  }

  async buscarPorId(id: number) {
  const chamado = await this.prisma.chamados_suporte.findUnique({
    where: { id },
  });

  if (!chamado) {
    throw new NotFoundException(`Chamado com ID #${id} não encontrado.`);
  }

  return chamado;
}
}