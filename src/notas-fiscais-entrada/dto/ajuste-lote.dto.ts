import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class AjusteLoteDto {
  @IsString()
  @IsOptional()
  numero_lote?: string;

  @IsDateString()
  @IsOptional()
  data_fabricacao?: string;

  @IsDateString()
  @IsOptional()
  data_validade?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  quantidade?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  custo_unitario?: number;
}