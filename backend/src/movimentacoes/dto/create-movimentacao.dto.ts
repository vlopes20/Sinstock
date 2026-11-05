import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateLoteDto } from '../../notas-fiscais-entrada/dto/create-item-entrada.dto';
export enum TipoMovimentacao {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
  AJUSTE = 'AJUSTE',
  TRANSFERENCIA = 'TRANSFERENCIA',
}
export class CreateMovimentacaoDto {
  @IsInt() @Min(1) produto_id: number;
  @IsInt() @Min(1) filial_id: number;
  @IsOptional() @IsInt() @Min(1) lote_id?: number;
  @IsEnum({ ENTRADA: 'ENTRADA', SAIDA: 'SAIDA', AJUSTE: 'AJUSTE' })
  tipo: TipoMovimentacao;
  @IsNumber({ maxDecimalPlaces: 3 }) @Min(0) quantidade: number;
  @IsOptional() @IsString() @MaxLength(1000) observacao?: string;
  @IsOptional() @IsString() @MaxLength(50) referencia?: string;
  @IsOptional() @IsInt() @Min(1) fornecedor_id?: number;
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  custo_unitario?: number;
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLoteDto)
  lote?: CreateLoteDto;
}
