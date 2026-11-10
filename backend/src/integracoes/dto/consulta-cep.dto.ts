import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ConsultaCepDto {
  @ApiProperty({
    description: 'CEP para busca (8 dígitos com ou sem hífen)',
    example: '01001000',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{5}-?[0-9]{3}$/, {
    message: 'O CEP deve conter 8 dígitos no formato 00000000 ou 00000-000.',
  })
  cep!: string;
}