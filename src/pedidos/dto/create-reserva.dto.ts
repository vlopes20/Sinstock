import { IsArray, IsInt, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemCheckoutDto } from './create-checkout.dto';

export class CreateReservaDto {
  @IsInt()
  @IsNotEmpty()
  filial_id: number;

  @IsInt()
  @IsOptional()
  cliente_id?: number;

  @IsInt()
  @IsOptional()
  minutos_expiracao?: number = 15;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemCheckoutDto)
  itens: ItemCheckoutDto[];
}