import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginacaoFiltroDto } from '../../common/dto/paginacao-filtro.dto';
import { parseBoolean } from '../../common/boolean.transform';
export class FiltroNotificacoesDto extends PaginacaoFiltroDto {
  @IsOptional()
  @Transform(({ obj, key }) => parseBoolean(obj[key]))
  @IsBoolean()
  lida?: boolean;
}
