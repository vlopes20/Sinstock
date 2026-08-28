import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './usuario/users.module';
import { AuthModule } from './auth/auth.module';
import { ProdutosModule } from './produtos/produtos.module';


@Module({
    imports: [PrismaModule, UsersModule, AuthModule, ProdutosModule]
})
export class AppModule { }