import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from 'src/common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuração Dinâmica do CORS via .env
  const rawOrigins = configService.get<string>('CORS_ORIGIN', '*');
  const allowedOrigins = rawOrigins.includes(',')
    ? rawOrigins.split(',').map((origin) => origin.trim())
    : rawOrigins;

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validação Global dos DTOs com conversão implícita
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Tratamento Global de Exceções do Prisma
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Configuração da Documentação Swagger
  const config = new DocumentBuilder()
    .setTitle('Sinstock API')
    .setDescription(
      'API REST para Gestão de Estoque, Filiais e Autenticação com 2FA',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira seu token JWT obtido no login',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Porta dinâmica obtida do .env (padrão 3000)
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
  console.log(
    `📖 Documentação Swagger disponível em: http://localhost:${port}/api`,
  );
}
bootstrap();