import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';
import '../common/environment';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    let connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL não foi definida no arquivo .env');
    }

    // Garante a permissão de recuperação da chave RSA para resolver erros de handshake/pool no MySQL/MariaDB
    if (!connectionString.includes('allowPublicKeyRetrieval')) {
      const separador = connectionString.includes('?') ? '&' : '?';
      connectionString += `${separador}allowPublicKeyRetrieval=true`;
    }

    // Inicializa o adaptador nativo do MariaDB/MySQL do Prisma 7
    const adapter = new PrismaMariaDb(connectionString);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
