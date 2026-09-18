import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AlertasModule } from './alertas/alertas.module';
import { AuthModule } from './auth/auth.module';
import { CategoriasModule } from './categorias/categorias.module';
import { FornecedoresModule } from './fornecedores/fornecedores.module';
import { FiliaisModule } from './filiais/filiais.module';
import { NotasFiscaisEntradaModule } from './notas-fiscais-entrada/notas-fiscais-entrada.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { MovimentacoesModule } from './movimentacoes/movimentacoes.module';
import { PerfisModule } from './perfis/perfis.module';
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
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    PerfisModule,
    ProdutosModule,
    CategoriasModule,
    NotasFiscaisEntradaModule,
    FornecedoresModule,
    AlertasModule,
    NotificacoesModule,
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