export interface GraficoPizzaCategoria {
  categoria: string;
  quantidadeTotal: number;
  valorTotal: number;
}

export interface GraficoLinhaMovimentacao {
  data: string; // Formato YYYY-MM-DD
  entradas: number;
  saidas: number;
}

export interface GraficoBarraAlertaStock {
  produto: string;
  stockAtual: number;
  stockMinimo: number;
}

export interface EventoRealTimeStock {
  tipo: 'ENTRADA' | 'SAIDA' | 'ALERTA_STOCK';
  produtoId: string;
  nomeProduto: string;
  quantidade: number;
  stockAtual: number;
  timestamp: string;
}