import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { PaginacaoFiltroDto } from '../../common/dto/paginacao-filtro.dto';

export class FiltroProdutosDto extends PaginacaoFiltroDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoria_id?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  apenas_estoque_baixo?: boolean;

  @IsOptional()
  data_inicio?: string;

  @IsOptional()
  data_fim?: string;
}