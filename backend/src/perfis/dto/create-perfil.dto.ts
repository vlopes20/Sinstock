import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreatePerfilDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do perfil é obrigatório' })
  nome: string;

  @IsObject({ message: 'As permissões devem ser um objeto JSON válido' })
  @IsNotEmpty({ message: 'As permissões são obrigatórias' })
  permissoes: Record<string, any>;
}