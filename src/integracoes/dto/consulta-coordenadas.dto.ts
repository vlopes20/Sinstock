import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ConsultaCoordenadasDto {
  @ApiProperty({ description: 'Logradouro / Nome da rua', example: 'Avenida Paulista' })
  @IsString()
  @IsNotEmpty()
  logradouro!: string;

  @ApiProperty({ description: 'Nome do município', example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  cidade!: string;

  @ApiProperty({ description: 'Sigla do estado (2 caracteres)', example: 'SP' })
  @IsString()
  @Length(2, 2, { message: 'A UF deve ter exatamente 2 caracteres.' })
  uf!: string;
}