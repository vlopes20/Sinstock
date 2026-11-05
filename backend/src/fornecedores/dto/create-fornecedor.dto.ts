import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { parseBoolean } from '../../common/boolean.transform';
export class CreateFornecedorDto {
  @IsString() @IsNotEmpty() @MaxLength(150) nome_juridico: string;
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsString()
  @Matches(/^\d{14}$/)
  cnpj: string;
  @IsOptional() @IsString() @MaxLength(150) nome_fantasia?: string;
  @IsOptional() @IsString() @MaxLength(30) inscricao_estadual?: string;
  @IsOptional() @IsString() @MaxLength(100) contato?: string;
  @IsOptional() @IsString() @MaxLength(20) telefone?: string;
  @IsOptional() @IsEmail() @MaxLength(100) email?: string;
  @IsOptional() @IsString() @Matches(/^\d{5}-?\d{3}$/) cep?: string;
  @IsOptional() @IsString() @MaxLength(100) cidade?: string;
  @IsOptional() @IsString() @Matches(/^[A-Z]{2}$/) estado?: string;
  @IsOptional() @IsString() @MaxLength(255) endereco?: string;
  @IsOptional() @IsNumber() @IsLatitude() latitude?: number;
  @IsOptional() @IsNumber() @IsLongitude() longitude?: number;
  @IsOptional() @IsString() @MaxLength(100) categoria?: string;
  @IsOptional() @IsInt() @Min(0) prazo_entrega?: number;
  @IsOptional() @IsString() @MaxLength(100) condicao_pagamento?: string;
  @IsOptional()
  @Transform(({ obj, key }) => parseBoolean(obj[key]))
  @IsBoolean()
  ativo?: boolean;
  @IsOptional() @IsString() @MaxLength(5000) observacoes?: string;
}
