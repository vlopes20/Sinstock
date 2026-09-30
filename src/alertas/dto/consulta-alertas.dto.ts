import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ConsultaAlertasDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O ID da filial deve ser um número inteiro.' })
  @Min(1, { message: 'O ID da filial deve ser maior que zero.' })
  filial_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Os dias de vencimento devem ser um número inteiro.' })
  @Min(1, { message: 'O parâmetro de dias para vencimento deve ser de pelo menos 1 dia.' })
  @Max(365, { message: 'O parâmetro de dias para vencimento não pode exceder 365 dias.' })
  dias_vencimento?: number = 30; // Valor padrão de 30 dias se omitido
}