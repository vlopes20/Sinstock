import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
export class ConfirmPasswordDto {
  @IsString() @MinLength(1) @MaxLength(72) senha_atual: string;
}
export class ChangePasswordDto extends ConfirmPasswordDto {
  @IsString() @MinLength(8) @MaxLength(72) nova_senha: string;
}
export class EmailSetupDto {
  @IsUUID() challenge_id: string;
  @IsString() @Matches(/^\d{6}$/) codigo: string;
}
export class DisableTwoFactorDto extends ConfirmPasswordDto {
  @IsOptional() @IsUUID() challenge_id?: string;
  @IsString() @Matches(/^\d{6}$/) codigo: string;
}
