import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateLoteDto {
  @IsString()
  @IsNotEmpty()
  numero_lote!: string;

  @IsDateString()
  @IsOptional()
  data_fabricacao?: string;

  @IsDateString()
  @IsNotEmpty()
  data_validade!: string;
}

export class CreateItemEntradaDto {
  @IsInt()
  @IsNotEmpty()
  produto_id!: number;

  @IsNumber()
  @IsPositive()
  quantidade!: number;

  @IsNumber()
  @Min(0)
  custo_unitario!: number;

  @IsInt()
  @IsOptional()
  lote_id?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLoteDto)
  lote?: CreateLoteDto;
}