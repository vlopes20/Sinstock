import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
export class ItemCheckoutDto {
  @IsInt() @Min(1) produto_id: number;
  @IsOptional() @IsInt() @Min(1) lote_id?: number;
  @IsNumber({ maxDecimalPlaces: 3 }) @IsPositive() quantidade: number;
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  preco_unitario?: number;
}
export class CreateCheckoutDto {
  @IsOptional() @IsInt() @Min(1) cliente_id?: number;
  @IsInt() @Min(1) filial_id: number;
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemCheckoutDto)
  itens: ItemCheckoutDto[];
  @IsOptional()
  @IsIn(['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO', 'BOLETO', 'OUTRO'])
  pagamento?: string;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) desconto?: number;
  @IsOptional() @IsString() @MaxLength(1000) observacao?: string;
}
