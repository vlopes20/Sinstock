import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { parseBoolean } from '../../common/boolean.transform';
export class CompanySettingsDto {
  @IsOptional() @IsString() @MaxLength(150) nome?: string;
  @IsOptional() @IsString() @MaxLength(20) cnpj?: string;
  @IsOptional() @IsEmail() @MaxLength(100) email?: string;
  @IsOptional() @IsString() @MaxLength(20) telefone?: string;
  @IsOptional() @IsString() @MaxLength(255) endereco?: string;
  @IsOptional() @IsString() @MaxLength(100) cidade?: string;
  @IsOptional() @IsString() @Matches(/^[A-Z]{2}$/) estado?: string;
}
export class StockSettingsDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(9999999.999)
  estoque_minimo_padrao?: number;
  @IsOptional() @IsInt() @Min(1) @Max(7) dias_validade?: number;
  @IsOptional() @IsIn([true]) bloquear_negativo?: boolean;
}
export class PreferencesDto {
  @IsOptional()
  @Transform(({ obj, key }) => parseBoolean(obj[key]))
  @IsBoolean()
  notificar_estoque?: boolean;
  @IsOptional()
  @Transform(({ obj, key }) => parseBoolean(obj[key]))
  @IsBoolean()
  notificar_validade?: boolean;
  @IsOptional()
  @Transform(({ obj, key }) => parseBoolean(obj[key]))
  @IsBoolean()
  logout_inativo?: boolean;
  @IsOptional() @IsInt() @IsIn([10, 20, 50, 100]) itens_por_pagina?: number;
}
