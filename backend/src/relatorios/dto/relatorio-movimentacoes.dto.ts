import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional } from 'class-validator';

export class RelatorioMovimentacoesDto {
  @ApiPropertyOptional({ description: 'Data de início (YYYY-MM-DD)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  data_inicio?: Date;

  @ApiPropertyOptional({ description: 'Data de fim (YYYY-MM-DD)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  data_fim?: Date;

  @ApiPropertyOptional({ description: 'Filtrar por filial' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  filial_id?: number;

  @ApiPropertyOptional({ description: 'Filtrar por produto' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  produto_id?: number;
}