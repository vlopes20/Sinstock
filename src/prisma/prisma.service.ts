import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
<<<<<<< HEAD
  constructor() {
    const adapter = new PrismaMariaDb({
      host: process.env.DB_HOST!,
      port: Number(process.env.DB_PORT!),
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
    });
=======
    constructor() {
        const urlString = process.env.DATABASE_URL;
        if (!urlString) {
            throw new Error('A variável de ambiente DATABASE_URL não foi definida no arquivo .env!');
        }

        const dbUrl = new URL(urlString);

        const adapter = new PrismaMariaDb({
            host: dbUrl.hostname,
            port: Number(dbUrl.port) || 3306,
            user: dbUrl.username,
            password: decodeURIComponent(dbUrl.password),
            database: dbUrl.pathname.replace('/', ''),
        });
>>>>>>> feature-vinidev

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}