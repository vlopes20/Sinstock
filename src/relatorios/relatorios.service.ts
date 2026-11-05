import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExcelService } from '../common/services/excel.service';
import { PdfService } from '../common/services/pdf.service';
import { ConsultaRelatorioDto } from './dto/consulta-relatorio.dto';
type Column = {
  key: string;
  header: string;
  format?: 'number' | 'money' | 'date';
};
type Row = Record<string, string | number | null>;

@Injectable()
export class RelatoriosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly excel: ExcelService,
    private readonly pdf: PdfService,
  ) {}
  private period(dto: ConsultaRelatorioDto, column: Prisma.Sql) {
    const from = dto.data_inicio
      ? new Date(
          dto.data_inicio.length === 10
            ? dto.data_inicio + 'T00:00:00-03:00'
            : dto.data_inicio,
        )
      : undefined;
    const until = dto.data_fim
      ? new Date(
          dto.data_fim.length === 10
            ? dto.data_fim + 'T23:59:59.999-03:00'
            : dto.data_fim,
        )
      : undefined;
    if (from && until && from > until)
      throw new BadRequestException(
        'A data inicial deve ser anterior à final.',
      );
    return Prisma.sql`${from ? Prisma.sql`AND ${column} >= ${from}` : Prisma.empty} ${until ? Prisma.sql`AND ${column} <= ${until}` : Prisma.empty}`;
  }
  private products(dto: ConsultaRelatorioDto) {
    return Prisma.sql`${dto.produto_id ? Prisma.sql`AND p.id = ${dto.produto_id}` : Prisma.empty}
      ${dto.categoria_id ? Prisma.sql`AND p.categoria_id = ${dto.categoria_id}` : Prisma.empty}
      ${dto.busca ? Prisma.sql`AND (p.nome LIKE ${'%' + dto.busca + '%'} OR p.codigo_barras LIKE ${'%' + dto.busca + '%'})` : Prisma.empty}`;
  }
  private branch(dto: ConsultaRelatorioDto, column: Prisma.Sql) {
    return dto.filial_id
      ? Prisma.sql`AND ${column} = ${dto.filial_id}`
      : Prisma.empty;
  }
  private definition(dto: ConsultaRelatorioDto): {
    title: string;
    columns: Column[];
    query: Prisma.Sql;
  } {
    // Allocate an order discount proportionally to the sale lines. Round at the final report grouping.
    const value = Prisma.sql`CASE WHEN pv.total + pv.desconto > 0 THEN iv.quantidade * iv.preco_unitario * pv.total / (pv.total + pv.desconto) ELSE 0 END`;
    const sales = Prisma.sql`FROM pedidos_venda pv JOIN itens_venda iv ON iv.pedido_id = pv.id
      JOIN produtos p ON p.id = iv.produto_id JOIN categorias c ON c.id = p.categoria_id
      JOIN filiais f ON f.id = pv.filial_id LEFT JOIN clientes cl ON cl.id = pv.cliente_id
      WHERE pv.status = 'CONCLUIDO' ${this.period(dto, Prisma.sql`pv.data_venda`)} ${this.branch(dto, Prisma.sql`pv.filial_id`)} ${this.products(dto)}`;
    if (dto.tipo === 'vendas')
      return {
        title: 'Vendas confirmadas',
        columns: [
          { key: 'id', header: 'Venda' },
          { key: 'data', header: 'Data', format: 'date' },
          { key: 'cliente', header: 'Cliente' },
          { key: 'filial', header: 'Filial' },
          { key: 'pagamento', header: 'Pagamento' },
          { key: 'quantidade', header: 'Quantidade', format: 'number' },
          { key: 'total', header: 'Faturamento', format: 'money' },
        ],
        query: Prisma.sql`SELECT pv.id, pv.data_venda AS data, COALESCE(cl.nome, 'Consumidor não identificado') AS cliente,
        f.nome AS filial, COALESCE(pv.pagamento, 'Não informado') AS pagamento, SUM(iv.quantidade) AS quantidade,
        ROUND(SUM(${value}), 2) AS total ${sales}
        GROUP BY pv.id, pv.data_venda, cl.nome, f.nome, pv.pagamento ORDER BY pv.id DESC`,
      };
    if (dto.tipo === 'categorias')
      return {
        title: 'Vendas por categoria',
        columns: [
          { key: 'categoria', header: 'Categoria' },
          { key: 'produtos', header: 'Produtos vendidos', format: 'number' },
          { key: 'quantidade', header: 'Quantidade', format: 'number' },
          { key: 'total', header: 'Faturamento', format: 'money' },
        ],
        query: Prisma.sql`SELECT c.nome AS categoria, COUNT(DISTINCT p.id) AS produtos,
        SUM(iv.quantidade) AS quantidade, ROUND(SUM(${value}), 2) AS total ${sales}
        GROUP BY c.id, c.nome ORDER BY total DESC, c.nome`,
      };
    if (dto.tipo === 'mais-vendidos' || dto.tipo === 'menos-vendidos')
      return {
        title:
          dto.tipo === 'mais-vendidos'
            ? 'Produtos mais vendidos'
            : 'Produtos menos vendidos',
        columns: [
          { key: 'produto', header: 'Produto' },
          { key: 'marca', header: 'Marca' },
          { key: 'categoria', header: 'Categoria' },
          { key: 'quantidade', header: 'Quantidade vendida', format: 'number' },
          { key: 'total', header: 'Faturamento', format: 'money' },
        ],
        query: Prisma.sql`SELECT p.nome AS produto, p.marca, c.nome AS categoria,
        COALESCE(SUM(CASE WHEN pv.id IS NOT NULL THEN iv.quantidade ELSE 0 END), 0) AS quantidade,
        ROUND(COALESCE(SUM(CASE WHEN pv.id IS NOT NULL THEN ${value} ELSE 0 END), 0), 2) AS total
        FROM produtos p JOIN categorias c ON c.id = p.categoria_id
        LEFT JOIN itens_venda iv ON iv.produto_id = p.id
        LEFT JOIN pedidos_venda pv ON pv.id = iv.pedido_id AND pv.status = 'CONCLUIDO'
          ${this.period(dto, Prisma.sql`pv.data_venda`)} ${this.branch(dto, Prisma.sql`pv.filial_id`)}
        WHERE 1 = 1 ${this.products(dto)}
        GROUP BY p.id, p.nome, p.marca, c.nome
        ORDER BY quantidade ${dto.tipo === 'mais-vendidos' ? Prisma.sql`DESC` : Prisma.sql`ASC`}, p.nome`,
      };
    if (dto.tipo === 'movimentacoes')
      return {
        title: 'Histórico de movimentações',
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'data', header: 'Data', format: 'date' },
          { key: 'produto', header: 'Produto' },
          { key: 'filial', header: 'Filial' },
          { key: 'lote', header: 'Lote' },
          { key: 'tipo', header: 'Operação' },
          { key: 'quantidade', header: 'Quantidade', format: 'number' },
          { key: 'usuario', header: 'Responsável' },
          { key: 'observacao', header: 'Motivo / referência' },
        ],
        query: Prisma.sql`SELECT lm.id, lm.data_hora AS data, p.nome AS produto, f.nome AS filial,
        l.numero_lote AS lote, lm.tipo_movimentacao AS tipo, lm.quantidade, u.nome AS usuario, COALESCE(lm.observacao, lm.referencia) AS observacao
        FROM logs_movimentacoes lm JOIN produtos p ON p.id = lm.produto_id JOIN filiais f ON f.id = lm.filial_id
        JOIN usuarios u ON u.id = lm.usuario_id LEFT JOIN lotes l ON l.id = lm.lote_id
        WHERE 1 = 1 ${this.period(dto, Prisma.sql`lm.data_hora`)} ${this.branch(dto, Prisma.sql`lm.filial_id`)} ${this.products(dto)}
        ORDER BY lm.id DESC`,
      };
    if (dto.tipo === 'vencidos' || dto.tipo === 'vencimento') {
      const today = new Date().toLocaleDateString('en-CA', {
        timeZone: 'America/Sao_Paulo',
      });
      const limit = new Date(new Date(today).getTime() + 7 * 86400000);
      return {
        title:
          dto.tipo === 'vencidos'
            ? 'Lotes vencidos com saldo'
            : 'Lotes com validade em até sete dias',
        columns: [
          { key: 'produto', header: 'Produto' },
          { key: 'lote', header: 'Lote' },
          { key: 'filial', header: 'Filial' },
          { key: 'validade', header: 'Validade', format: 'date' },
          { key: 'quantidade', header: 'Físico', format: 'number' },
          { key: 'reservado', header: 'Reservado', format: 'number' },
        ],
        query: Prisma.sql`SELECT p.nome AS produto, l.numero_lote AS lote, f.nome AS filial, l.data_validade AS validade,
          s.quantidade, s.quantidade_reservada AS reservado FROM saldos_estoque s
          JOIN produtos p ON p.id = s.produto_id JOIN lotes l ON l.id = s.lote_id JOIN filiais f ON f.id = s.filial_id
          WHERE s.quantidade > 0 AND l.data_validade ${dto.tipo === 'vencidos' ? Prisma.sql`< ${new Date(today)}` : Prisma.sql`<= ${limit}`}
          ${this.branch(dto, Prisma.sql`s.filial_id`)} ${this.products(dto)} ORDER BY l.data_validade, p.nome, f.nome`,
      };
    }
    const idle = dto.tipo === 'sem-movimento';
    return {
      title: idle
        ? 'Produtos sem movimentação recente'
        : 'Estoque atual por filial',
      columns: [
        { key: 'produto', header: 'Produto' },
        { key: 'sku', header: 'SKU' },
        { key: 'categoria', header: 'Categoria' },
        { key: 'filial', header: 'Filial' },
        { key: 'quantidade', header: 'Físico', format: 'number' },
        { key: 'reservado', header: 'Reservado', format: 'number' },
        { key: 'disponivel', header: 'Disponível', format: 'number' },
        { key: 'minimo', header: 'Mínimo', format: 'number' },
        { key: 'total', header: 'Valor físico', format: 'money' },
      ],
      query: Prisma.sql`SELECT p.nome AS produto, p.sku, c.nome AS categoria, f.nome AS filial,
        COALESCE(SUM(s.quantidade), 0) AS quantidade, COALESCE(SUM(s.quantidade_reservada), 0) AS reservado,
        COALESCE(SUM(s.quantidade - s.quantidade_reservada), 0) AS disponivel, COALESCE(p.estoque_minimo, 0) AS minimo,
        ROUND(COALESCE(SUM(s.quantidade * COALESCE(p.custo_medio, 0)), 0), 2) AS total
        FROM produtos p JOIN categorias c ON c.id = p.categoria_id CROSS JOIN filiais f
        LEFT JOIN saldos_estoque s ON s.produto_id = p.id AND s.filial_id = f.id
        WHERE 1 = 1 ${this.branch(dto, Prisma.sql`f.id`)} ${this.products(dto)}
        ${idle ? Prisma.sql`AND NOT EXISTS (SELECT 1 FROM logs_movimentacoes lm WHERE lm.produto_id = p.id AND lm.filial_id = f.id AND lm.data_hora >= ${new Date(Date.now() - dto.sem_movimento_dias * 86400000)})` : Prisma.empty}
        GROUP BY p.id, p.nome, p.sku, c.nome, f.id, f.nome, p.estoque_minimo ORDER BY p.nome, f.nome`,
    };
  }
  private normalize(rows: Record<string, unknown>[]): Row[] {
    return rows.map(
      (row) =>
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => [
            key,
            value instanceof Date
              ? value.toISOString()
              : Prisma.Decimal.isDecimal(value)
                ? value.toNumber()
                : typeof value === 'bigint'
                  ? value.toString()
                  : value,
          ]),
        ) as Row,
    );
  }
  async consultar(dto: ConsultaRelatorioDto) {
    const { title, columns, query } = this.definition(dto),
      pagina = dto.pagina ?? 1,
      limite = dto.limite ?? 10;
    const [count, rows] = await Promise.all([
      this.prisma.$queryRaw<{ total: bigint }[]>(
        Prisma.sql`SELECT COUNT(*) AS total FROM (${query}) report`,
      ),
      this.prisma.$queryRaw<Record<string, unknown>[]>(
        Prisma.sql`${query} LIMIT ${limite} OFFSET ${(pagina - 1) * limite}`,
      ),
    ]);
    const total = Number(count[0].total);
    return {
      titulo: title,
      colunas: columns,
      dados: this.normalize(rows),
      meta: { total, pagina, limite, totalPages: Math.ceil(total / limite) },
      contexto: ['estoque', 'vencidos', 'vencimento', 'sem-movimento'].includes(
        dto.tipo,
      )
        ? 'Posição atual. O período não altera o saldo atual; sem-movimento considera a janela de dias informada.'
        : 'Somente vendas confirmadas compõem faturamento e ranking. Descontos são distribuídos proporcionalmente entre os itens.',
    };
  }
  private formatted(row: Row, column: Column) {
    const value = row[column.key];
    if (value === null || value === undefined) return '';
    if (column.format === 'money')
      return Number(value).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    if (column.format === 'number')
      return Number(value).toLocaleString('pt-BR', {
        maximumFractionDigits: 3,
      });
    if (column.format === 'date')
      return column.key === 'validade'
        ? String(value).slice(0, 10).split('-').reverse().join('/')
        : new Date(value).toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
          });
    return String(value);
  }
  async exportar(dto: ConsultaRelatorioDto) {
    const { title, columns, query } = this.definition(dto);
    const rows = this.normalize(
      await this.prisma.$queryRaw<Record<string, unknown>[]>(
        Prisma.sql`${query} LIMIT 50001`,
      ),
    );
    if (rows.length > 50000)
      throw new BadRequestException(
        'A exportação aceita até 50.000 linhas. Refine os filtros.',
      );
    if (dto.formato === 'xlsx') {
      const numericRows = rows.map((row) =>
        Object.fromEntries(
          columns.map((column) => [
            column.key,
            ['number', 'money'].includes(column.format ?? '')
              ? Number(row[column.key] ?? 0)
              : this.formatted(row, column),
          ]),
        ),
      );
      return {
        buffer: await this.excel.gerarExcel(
          'Sinstock',
          columns.map((column) => ({ ...column, width: 25 })),
          numericRows,
        ),
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    }
    const data = rows.map((row) =>
      columns.map((column) => this.formatted(row, column)),
    );
    if (dto.formato === 'pdf')
      return {
        buffer: await this.pdf.gerarRelatorioTabela(
          'SINSTOCK — ' + title,
          columns.map((c) => c.header),
          data,
          'landscape',
        ),
        contentType: 'application/pdf',
      };
    // Quote every field, escape quotes/newlines, and neutralize spreadsheet formulas.
    const cell = (value: string) =>
      '"' +
      (/^[\s]*[=+@-]/.test(value) ? "'" : '') +
      value.replace(/"/g, '""') +
      '"';
    const csv = [columns.map((c) => c.header), ...data]
      .map((row) => row.map(cell).join(';'))
      .join('\r\n');
    return {
      buffer: Buffer.from('\uFEFF' + csv, 'utf8'),
      contentType: 'text/csv; charset=utf-8',
    };
  }
}
