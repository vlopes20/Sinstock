import { IsIn } from 'class-validator';
export class UpdateAtendimentoDto {
  @IsIn(['PENDENTE', 'EM_SEPARACAO', 'ENVIADO', 'ENTREGUE'])
  atendimento: string;
}
