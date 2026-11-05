import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsBoolean, ValidateIf } from 'class-validator';
import { parseBoolean } from '../../common/boolean.transform';
import { CreateUserDto } from './create-user.dto';
export class UpdateUserDto extends PartialType(CreateUserDto, {
  skipNullProperties: false,
}) {
  @ValidateIf((_, value) => value !== undefined)
  @Transform(({ obj, key }) => parseBoolean(obj[key]))
  @IsBoolean()
  ativo?: boolean;
}
