import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateTransferenciaDto {
  @ApiProperty({ description: 'ID da filial de origem' })
  @IsInt()
  @Min(1)
  filial_origem_id: number;

  @ApiProperty({ description: 'ID da filial de destino' })
  @IsInt()
  @Min(1)
  filial_destino_id: number;

  @ApiProperty({ description: 'ID do produto a ser transferido' })
  @IsInt()
  @Min(1)
  produto_id: number;

  @ApiPropertyOptional({ description: 'ID do lote (opcional)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  lote_id?: number;

  @ApiProperty({ description: 'Quantidade a ser transferida' })
  @IsNumber()
  @IsPositive()
  quantidade: number;

  @ApiPropertyOptional({ description: 'Observação ou justificativa da transferência' })
  @IsOptional()
  @IsString()
  observacao?: string;
}