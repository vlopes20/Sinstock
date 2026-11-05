import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
export class FilialQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) filial_id?: number;
}
