import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginacaoFiltroDto } from '../../common/dto/paginacao-filtro.dto';
import { parseBoolean } from '../../common/boolean.transform';
export class FiltroFornecedoresDto extends PaginacaoFiltroDto {
  @IsOptional() @IsString() @MaxLength(100) categoria?: string;
  @IsOptional() @IsString() @MaxLength(100) cidade?: string;
  @IsOptional()
  @Transform(({ obj, key }) => parseBoolean(obj[key]))
  @IsBoolean()
  ativo?: boolean;
}
