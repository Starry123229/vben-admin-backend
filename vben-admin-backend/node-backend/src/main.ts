import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module.js';

// 全局 BigInt JSON 序列化支持（Prisma 返回的 id 是 BigInt）
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Fastify 适配器，bodyLimit 支持大文件上传
  const adapter = new FastifyAdapter({
    bodyLimit: 20 * 1024 * 1024, // 20MB
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    { rawBody: false },
  );

  // 注册 @fastify/multipart 支持文件上传
  const multipart = await import('@fastify/multipart');
  await app.register(multipart.default as any, {
    limits: { fileSize: 20 * 1024 * 1024 },
  });

  // 注册 @fastify/cookie 支持 Cookie 操作
  const cookie = await import('@fastify/cookie');
  await app.register(cookie.default as any, {
    secret: process.env.COOKIE_SECRET || 'vben_admin_secret',
  });

  // 注册 @fastify/static 静态文件服务
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
  const fastifyStatic = await import('@fastify/static');
  await app.register(fastifyStatic.default as any, {
    root: join(process.cwd(), uploadDir),
    prefix: '/uploads/',
  });

  // 全局 ValidationPipe（DTO 校验）
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Accept, Authorization, Content-Type, X-Requested-With',
  });

  // 全局前缀 /api（与 Java 端 context-path: /api 一致）
  app.setGlobalPrefix('api', {
    exclude: ['uploads'],
  });

  // 全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger API 文档
  const config = new DocumentBuilder()
    .setTitle('Vben Admin Node.js API')
    .setDescription('## NestJS + Fastify + Prisma 后端 API 文档\n\n- 认证方式：Bearer Token (JWT)\n- 统一响应格式：`{ code, data, error, message }`\n- code=0 成功 / code=-1 失败')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'JWT',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      persistAuthorization: true,
      docExpansion: 'none',
    },
  });

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
  logger.log(`服务启动: http://localhost:${port}`);
  logger.log(`API 文档: http://localhost:${port}/api/docs`);
}
bootstrap();
