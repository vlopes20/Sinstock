import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

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
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantidade: number;

  @ApiPropertyOptional({ description: 'Observação ou justificativa' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observacao?: string;
}
