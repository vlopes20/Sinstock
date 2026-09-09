import { IsOptional, IsString, Length } from 'class-validator';

export class CreateFilialDto {
  @IsString()
  @Length(2, 100)
  nome: string;

  @IsOptional()
  @IsString()
  endereco?: string;
}