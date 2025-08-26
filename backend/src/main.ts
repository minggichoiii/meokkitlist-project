import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // ✅ Swagger 관련 import 추가

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS 설정
  app.enableCors({
    origin: '*', // ⚠️ 배포 시에는 ['https://your-frontend.com']처럼 제한하는 게 안전
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ✅ Swagger 설정 추가
  const config = new DocumentBuilder()
    .setTitle('MeokkitList API')
    .setDescription('API documentation for MeokkitList project')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // ✅ 서버 시작
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Server is running on http://localhost:${PORT}`);
  logger.log(`📘 Swagger docs available at http://localhost:${PORT}/api-docs`);
}
bootstrap();
