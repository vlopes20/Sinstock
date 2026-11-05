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
} from 'class-validator';
export class AjusteLoteDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(50) numero_lote?: string;
  @IsOptional() @IsDateString() data_fabricacao?: string;
  @IsOptional() @IsDateString() data_validade?: string;
  @IsOptional() @IsInt() @Min(1) item_entrada_id?: number;
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantidade?: number;
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  custo_unitario?: number;
  @IsString() @IsNotEmpty() @MaxLength(1000) motivo: string;
}
