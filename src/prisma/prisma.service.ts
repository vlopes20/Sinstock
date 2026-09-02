import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
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

        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }
}