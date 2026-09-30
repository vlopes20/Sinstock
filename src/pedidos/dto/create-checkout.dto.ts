import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, IsPositive, ValidateNested } from 'class-validator';

export class ItemCheckoutDto {
  @IsInt()
  produto_id: number;

  @IsOptional()
  @IsInt()
  lote_id?: number;

  @IsNumber()
  @IsPositive()
  quantidade: number;

  @IsNumber()
  @IsPositive()
  preco_unitario: number;
}

export class CreateCheckoutDto {
  @IsOptional()
  @IsInt()
  cliente_id?: number;

  @IsInt()
  filial_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemCheckoutDto)
  itens: ItemCheckoutDto[];
}