import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { PaginacaoFiltroDto } from '../../common/dto/paginacao-filtro.dto';
export const REPORT_TYPES = [
  'categorias',
  'vendas',
  'estoque',
  'movimentacoes',
  'mais-vendidos',
  'menos-vendidos',
  'vencidos',
  'vencimento',
  'sem-movimento',
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];
export class ConsultaRelatorioDto extends PaginacaoFiltroDto {
  @IsOptional() @IsIn(REPORT_TYPES) tipo: ReportType = 'categorias';
  @IsOptional() @IsIn(['pdf', 'xlsx', 'csv']) formato: 'pdf' | 'xlsx' | 'csv' =
    'csv';
  @IsOptional() @IsDateString() data_inicio?: string;
  @IsOptional() @IsDateString() data_fim?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) filial_id?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) categoria_id?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) produto_id?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  sem_movimento_dias = 30;
}
