import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateTransferenciaDto {
  @ApiProperty({ description: 'ID do produto' })
  @IsInt()
  @Min(1)
  produto_id: number;

  @ApiProperty({ description: 'ID da filial de origem' })
  @IsInt()
  @Min(1)
  filial_origem_id: number;

  @ApiProperty({ description: 'ID da filial de destino' })
  @IsInt()
  @Min(1)
  filial_destino_id: number;

  @ApiPropertyOptional({ description: 'ID do lote (opcional)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  lote_id?: number;

  @ApiProperty({ description: 'Quantidade transferida' })
  @IsInt()
  @Min(1)
  quantidade: number;

  @ApiPropertyOptional({ description: 'Observação ou justificativa' })
  @IsOptional()
  @IsString()
  observacao?: string;
}