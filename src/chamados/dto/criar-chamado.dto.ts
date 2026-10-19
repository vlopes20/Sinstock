import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum PrioridadeChamado {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

export class CriarChamadoDto {
  @ApiProperty({ example: 'Problema no leitor de código de barras' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: 'O leitor USB da bancada 2 deixou de bipar itens de stock.' })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({ enum: PrioridadeChamado, default: PrioridadeChamado.MEDIA })
  @IsEnum(PrioridadeChamado)
  prioridade: PrioridadeChamado;

  @ApiProperty({ example: 'suporte@empresa.com' })
  @IsString()
  @IsNotEmpty()
  emailSolicitante: string;
}