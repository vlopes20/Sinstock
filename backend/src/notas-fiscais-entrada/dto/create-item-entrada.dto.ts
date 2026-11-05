import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
export class CreateLoteDto {
  @IsString() @IsNotEmpty() @MaxLength(50) numero_lote: string;
  @IsOptional() @IsDateString() data_fabricacao?: string;
  @IsDateString() data_validade: string;
}
export class CreateItemEntradaDto {
  @IsInt() @Min(1) produto_id: number;
  @IsNumber({ maxDecimalPlaces: 3 }) @IsPositive() quantidade: number;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) custo_unitario: number;
  @IsOptional() @IsInt() @Min(1) lote_id?: number;
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLoteDto)
  lote?: CreateLoteDto;
}
