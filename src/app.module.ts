import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AlertasModule } from './alertas/alertas.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AuthModule } from './auth/auth.module';
import { BuscaGlobalModule } from './busca-global/busca-global.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ChamadosModule } from './chamados/chamados.module';
import { ClientesModule } from './clientes/clientes.module';
import { CommonModule } from './common/common.module';
import { DashboardModule } from './dashboards/dashboard.module';
import { FiliaisModule } from './filiais/filiais.module';
import { FornecedoresModule } from './fornecedores/fornecedores.module';
import { IntegracoesModule } from './integracoes/integracoes.module';
import { MailModule } from './mail/mail.module';
import { MovimentacoesModule } from './movimentacoes/movimentacoes.module';
import { NotasFiscaisEntradaModule } from './notas-fiscais-entrada/notas-fiscais-entrada.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { PerfisModule } from './perfis/perfis.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProdutosModule } from './produtos/produtos.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { SaldosEstoqueModule } from './saldos-estoque/saldos-estoque.module';
import { UsersModule } from './usuario/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60000),
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    CommonModule,
    AuditoriaModule,
    PerfisModule,
    ClientesModule,
    AuthModule,
    IntegracoesModule,
    BuscaGlobalModule,
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
    PedidosModule,
    DashboardModule,
    MailModule,
    ChamadosModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}