import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './usuario/users.module';
import { AuthModule } from './auth/auth.module';
import { ProdutosModule } from './produtos/produtos.module';
import { PerfisModule } from './perfis/perfis.module';


@Module({
    imports: [PrismaModule, UsersModule, AuthModule, ProdutosModule, PerfisModule]
})
export class AppModule { }