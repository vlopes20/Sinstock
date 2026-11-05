import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  @MaxLength(100)
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @Matches(/^[a-f0-9]{64}$/)
  token: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  senha: string;
}

export class TwoFactorCodeDto {
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'Informe os 6 dígitos do aplicativo autenticador.',
  })
  codigo: string;
}
