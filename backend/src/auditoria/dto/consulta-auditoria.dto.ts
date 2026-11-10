import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDate, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ConsultaAuditoriaDto {
  @ApiPropertyOptional({ description: 'Filtrar por ID do Utilizador' })
  @IsOptional()
  @IsString()
  usuarioId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por Tipo de Ação (ex: SAIDA_ESTOQUE, CRIACAO)' })
  @IsOptional()
  @IsString()
  acao?: string;

  @ApiPropertyOptional({ description: 'Filtrar por Recurso (ex: PRODUTO, REQUISICAO)' })
  @IsOptional()
  @IsString()
  recurso?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID do Recurso' })
  @IsOptional()
  @IsString()
  recursoId?: string;

  @ApiPropertyOptional({ description: 'Data Inicial (YYYY-MM-DD)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataInicio?: Date;

  @ApiPropertyOptional({ description: 'Data Final (YYYY-MM-DD)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataFim?: Date;

  @ApiPropertyOptional({ description: 'Página atual (Paginação)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página (Paginação)', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}