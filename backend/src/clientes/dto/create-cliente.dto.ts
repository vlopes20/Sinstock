import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ description: 'Nome completo ou razão social do cliente', example: 'João da Silva' })
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do cliente é obrigatório.' })
  @MaxLength(150, { message: 'O nome pode ter no máximo 150 caracteres.' })
  nome: string;

  @ApiPropertyOptional({ description: 'CPF ou CNPJ do cliente', example: '123.456.789-00' })
  @IsString({ message: 'O CPF/CNPJ deve ser um texto.' })
  @IsOptional()
  @MaxLength(20, { message: 'O CPF/CNPJ pode ter no máximo 20 caracteres.' })
  cpf_cnpj?: string;

  @ApiPropertyOptional({ description: 'Telefone de contato', example: '(11) 98765-4321' })
  @IsString({ message: 'O telefone deve ser um texto.' })
  @IsOptional()
  @MaxLength(20, { message: 'O telefone pode ter no máximo 20 caracteres.' })
  telefone?: string;

  @ApiPropertyOptional({ description: 'Endereço de e-mail do cliente', example: 'joao.silva@email.com' })
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsOptional()
  @MaxLength(100, { message: 'O e-mail pode ter no máximo 100 caracteres.' })
  email?: string;
}