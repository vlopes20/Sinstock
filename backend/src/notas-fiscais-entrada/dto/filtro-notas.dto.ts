import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { PaginacaoFiltroDto } from '../../common/dto/paginacao-filtro.dto';
export class FiltroNotasDto extends PaginacaoFiltroDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) filial_id?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) produto_id?: number;
  @IsOptional() @IsIn(['PENDENTE', 'RECEBIDA', 'CANCELADA']) status?:
    'PENDENTE' | 'RECEBIDA' | 'CANCELADA';
}
