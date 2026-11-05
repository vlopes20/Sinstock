import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
export class CreateUserDto {
  @IsString() @IsNotEmpty() @MaxLength(100) nome: string;
  @IsEmail() @MaxLength(100) email: string;
  @IsString() @MinLength(8) @MaxLength(72) senha: string;
  @IsInt() @Min(1) perfil_id: number;
  @IsOptional() @IsString() @MaxLength(20) telefone?: string;
}
