import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { PaginacaoFiltroDto } from '../../common/dto/paginacao-filtro.dto';
export class SaldosEstoqueFilterDto extends PaginacaoFiltroDto {
  @ApiPropertyOptional({ description: 'ID da filial para filtragem' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  filial_id?: number;

  @ApiPropertyOptional({ description: 'ID do produto para filtragem' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  produto_id?: number;
}
