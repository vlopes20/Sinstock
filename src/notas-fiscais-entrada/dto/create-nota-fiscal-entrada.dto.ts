import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
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
  @IsNumber()
  @IsNotEmpty()
  produto_id!: number;

  @IsNumber()
  @IsNotEmpty()
  quantidade!: number;

  @IsNumber()
  @IsNotEmpty()
  custo_unitario!: number;

  @IsNumber()
  @IsOptional()
  lote_id?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLoteDto)
  lote?: CreateLoteDto;
}

export class CreateNotaFiscalEntradaDto {
  @IsNumber()
  @IsNotEmpty()
  fornecedor_id!: number;

  @IsNumber()
  @IsNotEmpty()
  usuario_id!: number;

  @IsNumber()
  @IsOptional()
  filial_id?: number;

  @IsString()
  @IsNotEmpty()
  numero_nf!: string;

  @IsDateString()
  @IsNotEmpty()
  data_emissao!: string;

  @IsDateString()
  @IsOptional()
  data_recebimento?: string;

  @IsNumber()
  @IsNotEmpty()
  total!: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemEntradaDto)
  itens!: CreateItemEntradaDto[];
}