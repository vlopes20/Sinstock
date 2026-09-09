import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export enum TipoMovimentacao {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
}

export class CreateMovimentacaoDto {
  @IsInt()
  produto_id: number;

  @IsInt()
  filial_id: number;

  @IsOptional()
  @IsInt()
  lote_id?: number;

  @IsEnum(TipoMovimentacao)
  tipo: TipoMovimentacao;

  @IsNumber()
  @IsPositive()
  quantidade: number;

  @IsOptional()
  @IsString()
  observacao?: string;
}