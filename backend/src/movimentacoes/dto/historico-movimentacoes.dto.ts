import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  Max,
  Min,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { TipoMovimentacao } from './create-movimentacao.dto';

export class HistoricoMovimentacoesDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) filial_id?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) produto_id?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 50;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pagina = 1;
  @IsOptional() @IsEnum(TipoMovimentacao) tipo?: TipoMovimentacao;
  @IsOptional() @IsDateString() data_inicio?: string;
  @IsOptional() @IsDateString() data_fim?: string;
}
