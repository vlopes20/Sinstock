import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginacaoFiltroDto } from '../../common/dto/paginacao-filtro.dto';
export class SaldosEstoqueFilterDto extends PaginacaoFiltroDto {
  @ApiPropertyOptional({ description: 'ID da filial para filtragem' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  filial_id?: number;

  @ApiPropertyOptional({ description: 'ID do produto para filtragem' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  produto_id?: number;
}