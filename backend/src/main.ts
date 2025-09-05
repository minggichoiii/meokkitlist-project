// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

function parseOrigins(): (string | RegExp)[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) return ['http://localhost:3000']; // 기본값
  return raw.split(',').map(s => s.trim());
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1) Cookie 파서 (HttpOnly 쿠키 기반 인증)
  app.use(cookieParser());

  // 2) 글로벌 ValidationPipe (DTO 유효성 검사)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // 3) CORS 설정 (credentials=true → origin 화이트리스트 필수)
  const origins = parseOrigins();
  app.enableCors({
    origin: (origin, callback) => {
      // origin이 undefined인 경우(예: curl, Postman) 허용
      if (!origin) return callback(null, true);
      if (origins.includes(origin)) return callback(null, true);
      // 정규식 Origin도 지원
      const ok = origins.some(o => o instanceof RegExp && o.test(origin));
      return ok ? callback(null, true) : callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
  });

  // 4) Swagger 문서 (쿠키 인증 표시)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MeokkitList API')
    .setDescription('API documentation for MeokkitList project')
    .setVersion('1.0')
    // 쿠키 인증을 문서에 표시(실제 Swagger Try-Out에서 자동전송은 안 되지만 가이드용)
    .addCookieAuth('token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'token',
      description: 'HttpOnly JWT token cookie (set by /auth/login)',
    })
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, swaggerDoc);

  // 5) 서버 시작
  const PORT = parseInt(process.env.APP_PORT ?? '3001', 10);
  await app.listen(PORT);

  logger.log(`🚀 Server is running on http://localhost:${PORT}`);
  logger.log(`📘 Swagger docs at http://localhost:${PORT}/api-docs`);
  logger.log(`🔐 CORS origins: ${Array.isArray(origins) ? origins.join(', ') : origins}`);
}

bootstrap();
