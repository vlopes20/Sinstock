import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProdutosModule } from './produtos/produtos.module';
import { PerfisModule } from './perfis/perfis.module';

@Module({
<<<<<<< HEAD
  imports: [
    PrismaModule,
    ProdutosModule,
  ],
=======
    imports: [PrismaModule, UsersModule, AuthModule, ProdutosModule, PerfisModule]
>>>>>>> feature-vinidev
})
export class AppModule {}