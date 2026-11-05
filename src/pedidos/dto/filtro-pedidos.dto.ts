import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { PaginacaoFiltroDto } from '../../common/dto/paginacao-filtro.dto';
export class FiltroPedidosDto extends PaginacaoFiltroDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) filial_id?: number;
  @IsOptional() @IsIn(['ORCAMENTO', 'CONCLUIDO', 'CANCELADO']) status?:
    'ORCAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  @IsOptional() @IsDateString() data_inicio?: string;
  @IsOptional() @IsDateString() data_fim?: string;
  @IsOptional()
  @IsIn(['PIX', 'DINHEIRO', 'CREDITO', 'DEBITO', 'CARTAO', 'BOLETO', 'OUTRO'])
  pagamento?: string;
  @IsOptional()
  @IsIn(['PENDENTE', 'EM_SEPARACAO', 'ENVIADO', 'ENTREGUE'])
  atendimento?: string;
}
