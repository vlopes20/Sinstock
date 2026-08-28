import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateProdutoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  marca?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  tipo?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  codigo_de_barra!: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  estoque_minimo?: number;

  @IsInt()
  @IsNotEmpty()
  categoria_id!: number;
}