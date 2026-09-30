import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum TipoMovimentacao {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
  AJUSTE = 'AJUSTE',
}

export class CreateMovimentacaoDto {
  @ApiProperty({ description: 'ID do produto' })
  @IsInt()
  @Min(1)
  produto_id: number;

  @ApiProperty({ description: 'ID da filial onde ocorre a movimentação' })
  @IsInt()
  @Min(1)
  filial_id: number;

  @ApiPropertyOptional({ description: 'ID do lote (opcional)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  lote_id?: number;

  @ApiProperty({ enum: TipoMovimentacao, description: 'Tipo da movimentação' })
  @IsEnum(TipoMovimentacao)
  tipo: TipoMovimentacao;

  @ApiProperty({ description: 'Quantidade movimentada' })
  @IsInt()
  @Min(1)
  quantidade: number;

  @ApiPropertyOptional({ description: 'Observação ou justificativa' })
  @IsOptional()
  @IsString()
  observacao?: string;
}