import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { CreateCheckoutDto } from './create-checkout.dto';
export class CreateReservaDto extends CreateCheckoutDto {
  @IsOptional() @IsInt() @Min(1) @Max(1440) minutos_expiracao = 15;
}
