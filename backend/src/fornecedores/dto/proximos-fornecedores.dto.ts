import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginacaoFiltroDto } from '../../common/dto/paginacao-filtro.dto';
export class ProximosFornecedoresDto extends PaginacaoFiltroDto {
  @IsOptional() @Type(() => Number) @IsNumber() @IsLatitude() latitude?: number;
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0.1) @Max(500) raio_km =
    50;
  @IsOptional() @IsString() @MaxLength(100) cidade?: string;
  @IsOptional() @IsString() @Matches(/^\d{5}-?\d{3}$/) cep?: string;
}
