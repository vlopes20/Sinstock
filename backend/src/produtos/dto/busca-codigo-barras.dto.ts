import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class BuscaCodigoBarrasDto {
  @ApiPropertyOptional({ description: 'ID da filial para filtrar o saldo disponível' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  filial_id?: number;
}