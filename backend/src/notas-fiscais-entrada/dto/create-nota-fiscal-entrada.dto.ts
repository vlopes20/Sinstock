import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateItemEntradaDto } from './create-item-entrada.dto';
export { CreateItemEntradaDto, CreateLoteDto } from './create-item-entrada.dto';

export class CreateNotaFiscalEntradaDto {
  @IsInt() @Min(1) fornecedor_id: number;
  @IsInt() @Min(1) filial_id: number;
  @IsString() @IsNotEmpty() @MaxLength(50) numero_nf: string;
  @IsOptional() @IsString() @MaxLength(1000) observacao?: string;
  @IsDateString() data_emissao: string;
  @IsOptional() @IsDateString() data_recebimento?: string;
  // Kept for older clients; the server always computes the total.
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) total?: number;
  @IsOptional() @IsIn(['PENDENTE', 'RECEBIDA']) status?:
    'PENDENTE' | 'RECEBIDA';
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateItemEntradaDto)
  itens: CreateItemEntradaDto[];
}
