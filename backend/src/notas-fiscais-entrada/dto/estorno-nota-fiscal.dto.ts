import { IsNotEmpty, IsString } from 'class-validator';

export class EstornoNotaFiscalDto {
  @IsString()
  @IsNotEmpty()
  motivo!: string;
}