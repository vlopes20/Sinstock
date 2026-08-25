import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;
}