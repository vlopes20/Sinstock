import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { FiliaisModule } from './filiais/filiais.module';
import { MovimentacoesModule } from './movimentacoes/movimentacoes.module';
=======
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
>>>>>>> feature-brancodev
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
<<<<<<< HEAD
=======
    ScheduleModule.forRoot(),
>>>>>>> feature-brancodev
    PrismaModule,
    AuthModule,
    UsersModule,
    ProdutosModule,
<<<<<<< HEAD
=======
    CategoriasModule,
    NotasFiscaisEntradaModule,
    FornecedoresModule,
    AlertasModule,
    NotificacoesModule,
>>>>>>> feature-brancodev
    FiliaisModule,
    SaldosEstoqueModule,
    MovimentacoesModule,
    RelatoriosModule
<<<<<<< HEAD
  ],
=======
    ],
>>>>>>> feature-brancodev
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}