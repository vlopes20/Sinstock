import {
  chamados_suporte_prioridade,
  chamados_suporte_status,
} from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginacaoFiltroDto } from '../../common/dto/paginacao-filtro.dto';
import { parseBoolean } from '../../common/boolean.transform';
export class CriarChamadoDto {
  @IsOptional() @IsUUID() request_id?: string;
  @IsString() @IsNotEmpty() @MaxLength(150) titulo: string;
  @IsString() @IsNotEmpty() @MaxLength(10000) descricao: string;
  @IsOptional()
  @IsEnum(chamados_suporte_prioridade)
  prioridade: chamados_suporte_prioridade = 'MEDIA';
  @IsOptional() @IsString() @MaxLength(100) categoria?: string;
  @IsOptional() @IsString() @MaxLength(100) pagina?: string;
}
export class FiltroChamadosDto extends PaginacaoFiltroDto {
  @IsOptional()
  @IsEnum(chamados_suporte_status)
  status?: chamados_suporte_status;
}
export class StatusChamadoDto {
  @IsEnum(chamados_suporte_status) status: chamados_suporte_status;
}
export class MensagemChamadoDto {
  @IsString() @IsNotEmpty() @MaxLength(5000) mensagem: string;
}
export class FaqDto {
  @IsString() @IsNotEmpty() @MaxLength(255) pergunta: string;
  @IsString() @IsNotEmpty() @MaxLength(20000) resposta: string;
  @IsOptional() @IsInt() @Min(0) ordem?: number;
  @IsOptional()
  @Transform(({ obj, key }) => parseBoolean(obj[key]))
  @IsBoolean()
  ativo?: boolean;
}
export class FiltroFaqDto extends PaginacaoFiltroDto {
  @IsOptional()
  @Transform(({ obj, key }) => parseBoolean(obj[key]))
  @IsBoolean()
  todos?: boolean;
}
