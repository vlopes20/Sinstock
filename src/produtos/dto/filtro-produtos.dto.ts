import { Transform, Type } from 'class-transformer';
import { parseBoolean } from '../../common/boolean.transform';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { PaginacaoFiltroDto } from '../../common/dto/paginacao-filtro.dto';

export class FiltroProdutosDto extends PaginacaoFiltroDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoria_id?: number;

  @IsOptional()
  @Transform(({ obj, key }) => parseBoolean(obj[key]))
  @IsBoolean()
  apenas_estoque_baixo?: boolean;

  @IsOptional() @IsIn(['normal', 'baixo', 'sem-estoque']) estoque?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  sem_movimento_dias?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) filial_id?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) fornecedor_id?: number;
  @IsOptional()
  @Transform(({ obj, key }) => parseBoolean(obj[key]))
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsDateString()
  data_inicio?: string;

  @IsOptional()
  @IsDateString()
  data_fim?: string;
}
