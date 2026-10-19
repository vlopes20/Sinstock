import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 1. Configuração Dinâmica do CORS via .env
  const rawOrigins = configService.get<string>('CORS_ORIGIN', '*');
  
  // Evita erro no navegador quando credentials: true e origin: '*' são usados juntos
  const allowedOrigins =
    rawOrigins === '*'
      ? true
      : rawOrigins.includes(',')
        ? rawOrigins.split(',').map((origin) => origin.trim())
        : rawOrigins;

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Validação Global dos DTOs com conversão implícita de tipos
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

  // 3. Tratamento Global de Exceções do Prisma
  app.useGlobalFilters(new PrismaExceptionFilter());

  // 4. Configuração da Documentação Swagger
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

  // 5. Inicialização do servidor HTTP na porta definida
  const port = configService.get<number>('PORT', 300);
  await app.listen(port);

  console.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
  console.log(
    `📖 Documentação Swagger disponível em: http://localhost:${port}/api`,
  );
}
bootstrap();