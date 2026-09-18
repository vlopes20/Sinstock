import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { FiliaisModule } from './filiais/filiais.module';
import { MovimentacoesModule } from './movimentacoes/movimentacoes.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProdutosModule } from './produtos/produtos.module';
import { SaldosEstoqueModule } from './saldos-estoque/saldos-estoque.module';
import { UsersModule } from './usuario/users.module';
import { RelatoriosModule } from './relatorios/relatorios.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProdutosModule,
    FiliaisModule,
    SaldosEstoqueModule,
    MovimentacoesModule,
    RelatoriosModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}