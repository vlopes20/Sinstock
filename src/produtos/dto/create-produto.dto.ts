import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProdutoDto {
  @IsInt()
  @IsNotEmpty()
  categoria_id!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nome!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  marca?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  codigo_barras?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  estoque_minimo?: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  preco_venda!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  custo_medio?: number;
}