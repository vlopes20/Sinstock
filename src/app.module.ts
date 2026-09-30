import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AlertasModule } from './alertas/alertas.module';
import { AuthModule } from './auth/auth.module';
import { CategoriasModule } from './categorias/categorias.module';
import { FiliaisModule } from './filiais/filiais.module';
import { FornecedoresModule } from './fornecedores/fornecedores.module';
import { MovimentacoesModule } from './movimentacoes/movimentacoes.module';
import { NotasFiscaisEntradaModule } from './notas-fiscais-entrada/notas-fiscais-entrada.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { PrismaModule } from './prisma/prisma.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { ProdutosModule } from './produtos/produtos.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { SaldosEstoqueModule } from './saldos-estoque/saldos-estoque.module';
import { UsersModule } from './usuario/users.module';

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
    AuthModule,
    UsersModule,
    ProdutosModule,
    CategoriasModule,
    NotasFiscaisEntradaModule,
    FornecedoresModule,
    AlertasModule,
    NotificacoesModule,
    FiliaisModule,
    SaldosEstoqueModule,
    MovimentacoesModule,
    RelatoriosModule,
    PedidosModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}