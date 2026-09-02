import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProdutosModule } from './produtos/produtos.module';

@Module({
  imports: [
    PrismaModule,
    ProdutosModule,
  ],
})
export class AppModule {}