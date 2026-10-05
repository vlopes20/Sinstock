import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    let connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL não foi definida no arquivo .env');
    }

    // Garante a permissão de recuperação da chave RSA para resolver o erro no handshake/pool
    if (!connectionString.includes('allowPublicKeyRetrieval')) {
      const separador = connectionString.includes('?') ? '&' : '?';
      connectionString += `${separador}allowPublicKeyRetrieval=true`;
    }

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