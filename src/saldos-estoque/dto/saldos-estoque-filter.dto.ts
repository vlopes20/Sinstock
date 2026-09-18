import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class SaldosEstoqueFilterDto extends PaginationDto {
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