import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class BuscaGlobalDto {
  @IsString({ message: 'O termo de busca deve ser um texto.' })
  @MinLength(2, { message: 'O termo de busca deve ter pelo menos 2 caracteres.' })
  termo: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O ID da filial deve ser um número inteiro.' })
  @Min(1, { message: 'O ID da filial deve ser maior que zero.' })
  filial_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro.' })
  @Min(1)
  @Max(50, {message: 'O limite não deve ser superior a 50.'})
  limite?: number = 10;
}