import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginacaoFiltroDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro.' })
  @Min(1, { message: 'A página mínima é 1.' })
  pagina?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro.' })
  @Min(1, { message: 'O limite mínimo por página é 1.' })
  @Max(100, { message: 'O limite máximo por página é 100.' })
  limite?: number = 10;

  @IsOptional()
  @IsString()
  busca?: string;

  @IsOptional()
  @IsString()
  ordenar_por?: string = 'criado_em';

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'A ordem deve ser "asc" ou "desc".' })
  ordem?: 'asc' | 'desc' = 'desc';
}