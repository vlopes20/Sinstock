import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class StockRequestDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Reenvie o mesmo UUID v4 e os mesmos dados ao repetir a solicitação.',
  })
  @IsOptional()
  @IsUUID('4')
  request_id?: string;
}
