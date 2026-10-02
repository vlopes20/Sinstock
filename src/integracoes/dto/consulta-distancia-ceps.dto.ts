import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ConsultaDistanciaCepsDto {
  @ApiProperty({ description: 'CEP de origem', example: '01001000' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{5}-?[0-9]{3}$/, {
    message: 'O CEP de origem deve conter 8 dígitos no formato 00000000 ou 00000-000.',
  })
  cep_origem!: string;

  @ApiProperty({ description: 'CEP de destino', example: '04538132' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{5}-?[0-9]{3}$/, {
    message: 'O CEP de destino deve conter 8 dígitos no formato 00000000 ou 00000-000.',
  })
  cep_destino!: string;

  @ApiPropertyOptional({ description: 'Raio máximo em KM para validação', example: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  raio_maximo_km?: number;
}