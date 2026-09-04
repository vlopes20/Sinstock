import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PerfisModule } from './perfis/perfis.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProdutosModule } from './produtos/produtos.module';
import { UsersModule } from './usuario/users.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    PerfisModule,
    ProdutosModule,
  ],
})
export class AppModule {}