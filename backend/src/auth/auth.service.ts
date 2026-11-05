import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../usuario/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { TwoFactorService } from './two-factor.service';
import { EmailChallengeService } from './email-challenge.service';
import {
  ChangePasswordDto,
  DisableTwoFactorDto,
  EmailSetupDto,
} from './dto/account.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly twoFactorService: TwoFactorService,
    private readonly email: EmailChallengeService,
    private readonly prisma: PrismaService,
  ) {}
  private async token(user: {
    id: number;
    nome: string;
    email: string;
    perfil_id: number;
    auth_version: number;
  }) {
    await this.prisma.usuarios.update({
      where: { id: user.id },
      data: { ultimo_acesso: new Date() },
    });
    return {
      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        perfil_id: user.perfil_id,
        version: user.auth_version,
      }),
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil_id: user.perfil_id,
      },
    };
  }
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(
      dto.email.trim().toLowerCase(),
    );
    if (!user?.ativo || !(await bcrypt.compare(dto.senha, user.senha_hash)))
      throw new UnauthorizedException(
        'Credenciais inválidas ou usuário inativo.',
      );
    if (user.isTwoFactorEnable) {
      if (user.two_factor_method === 'EMAIL') return this.emailLogin(user);
      return {
        mfaRequired: true,
        method: 'TOTP',
        userId: user.id,
        message: 'Insira o código de seis dígitos do aplicativo autenticador.',
        preAuthToken: this.jwtService.sign(
          {
            sub: user.id,
            isPreAuth: true,
            method: 'TOTP',
            version: user.auth_version,
          },
          { expiresIn: '5m' },
        ),
      };
    }
    return this.token(user);
  }
  private async emailLogin(user: {
    id: number;
    email: string;
    auth_version: number;
  }) {
    const challenge = await this.email.issue(user, 'LOGIN');
    return {
      mfaRequired: true,
      method: 'EMAIL',
      userId: user.id,
      expiresAt: challenge.expiresAt,
      message: 'Enviamos um código de seis dígitos para o seu e-mail.',
      preAuthToken: this.jwtService.sign(
        {
          sub: user.id,
          isPreAuth: true,
          method: 'EMAIL',
          challengeId: challenge.challengeId,
          version: user.auth_version,
        },
        { expiresIn: '5m' },
      ),
    };
  }
  async resendEmail(userId: number) {
    const user = await this.usersService.findByIdWithSecrets(userId);
    if (user.two_factor_method !== 'EMAIL')
      throw new BadRequestException(
        'Esta conta utiliza um aplicativo autenticador.',
      );
    return this.emailLogin(user);
  }
  async authenticateTwoFactor(
    userId: number,
    code: string,
    challengeId?: string,
  ) {
    const user = await this.usersService.findByIdWithSecrets(userId);
    if (!user?.ativo || !user.isTwoFactorEnable)
      throw new BadRequestException('O segundo fator não está ativado.');
    if (user.two_factor_method === 'EMAIL')
      await this.email.consume(userId, challengeId, code, 'LOGIN');
    else if (
      !user.twoFactorSecret ||
      !this.twoFactorService.verifyTwoFactorCode(code, user.twoFactorSecret)
    )
      throw new UnauthorizedException('Código 2FA inválido ou expirado.');
    return this.token(user);
  }
  private async password(userId: number, password: string) {
    const user = await this.usersService.findByIdWithSecrets(userId);
    if (!user.ativo || !(await bcrypt.compare(password, user.senha_hash)))
      throw new BadRequestException('A senha atual está incorreta.');
    return user;
  }
  async startEmailSetup(userId: number, password: string) {
    const user = await this.password(userId, password);
    if (user.isTwoFactorEnable)
      throw new BadRequestException(
        'Desative o segundo fator atual antes de escolher outro método.',
      );
    return this.email.issue(user, 'ENABLE');
  }
  async enableEmail(userId: number, dto: EmailSetupDto) {
    await this.email.consume(userId, dto.challenge_id, dto.codigo, 'ENABLE');
    await this.prisma.usuarios.update({
      where: { id: userId },
      data: {
        isTwoFactorEnable: true,
        two_factor_method: 'EMAIL',
        twoFactorSecret: null,
        auth_version: { increment: 1 },
      },
    });
    return {
      message: 'Segundo fator por e-mail ativado. Entre novamente.',
      reautenticar: true,
    };
  }
  async startDisableEmail(userId: number, password: string) {
    const user = await this.password(userId, password);
    if (!user.isTwoFactorEnable || user.two_factor_method !== 'EMAIL')
      throw new BadRequestException(
        'O segundo fator por e-mail não está ativo.',
      );
    return this.email.issue(user, 'DISABLE');
  }
  async disableTwoFactor(userId: number, dto: DisableTwoFactorDto) {
    const user = await this.password(userId, dto.senha_atual);
    if (!user.isTwoFactorEnable)
      throw new BadRequestException('O segundo fator já está desativado.');
    if (user.two_factor_method === 'EMAIL')
      await this.email.consume(userId, dto.challenge_id, dto.codigo, 'DISABLE');
    else if (
      !user.twoFactorSecret ||
      !this.twoFactorService.verifyTwoFactorCode(
        dto.codigo,
        user.twoFactorSecret,
      )
    )
      throw new BadRequestException('Código inválido.');
    await this.prisma.usuarios.update({
      where: { id: userId },
      data: {
        isTwoFactorEnable: false,
        twoFactorSecret: null,
        auth_version: { increment: 1 },
      },
    });
    return {
      message: 'Segundo fator desativado. Entre novamente.',
      reautenticar: true,
    };
  }
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const hash = await bcrypt.hash(dto.nova_senha, 10);
    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw(
        Prisma.sql`SELECT id FROM usuarios WHERE id = ${userId} FOR UPDATE`,
      );
      const user = await tx.usuarios.findUnique({ where: { id: userId } });
      if (
        !user?.ativo ||
        !(await bcrypt.compare(dto.senha_atual, user.senha_hash))
      )
        throw new BadRequestException('A senha atual está incorreta.');
      await tx.usuarios.update({
        where: { id: userId },
        data: {
          senha_hash: hash,
          auth_version: { increment: 1 },
          atualizado_em: new Date(),
        },
      });
      await tx.passwordResetToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: new Date() },
      });
      await tx.emailLoginChallenge.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: new Date() },
      });
    });
    return { message: 'Senha alterada. Entre novamente.', reautenticar: true };
  }
  async logout(userId: number) {
    await this.usersService.revokeSessions(userId);
    return { message: 'Sessões encerradas.' };
  }
  async getProfile(userId: number) {
    const user = await this.usersService.findByIdWithSecrets(userId);
    if (!user?.ativo)
      throw new UnauthorizedException('Usuário não encontrado ou inativo.');
    const {
      senha_hash,
      twoFactorSecret,
      token_2fa,
      token_expiracao,
      auth_version,
      ...profile
    } = user;
    return profile;
  }
}
