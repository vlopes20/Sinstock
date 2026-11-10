import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { parseBoolean } from '../../common/boolean.transform';
export class CreateProdutoDto {
  @IsInt() @Min(1) categoria_id: number;
  @IsString() @IsNotEmpty() @MaxLength(150) nome: string;
  @IsOptional() @IsString() @MaxLength(100) marca?: string;
  @IsOptional() @IsString() @MaxLength(100) codigo_barras?: string;
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  estoque_minimo?: number;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) preco_venda: number;
  @IsOptional() @IsString() @MaxLength(5000) descricao?: string;
  @IsOptional() @IsString() @MaxLength(100) sku?: string;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(20) unidade?: string;
  @IsOptional()
  @Transform(({ obj, key }) => parseBoolean(obj[key]))
  @IsBoolean()
  ativo?: boolean;
  @IsOptional() @IsString() @MaxLength(5000) observacao?: string;
  @IsOptional() @IsInt() @Min(1) fornecedor_id?: number;
}
