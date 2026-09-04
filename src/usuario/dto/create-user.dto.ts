import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsNumber()
  @IsNotEmpty()
  perfil_id: number;

  @IsString()
  @IsOptional()
  telefone?: string;
}