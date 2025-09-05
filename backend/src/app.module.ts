// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
// 캐시 스토어: v1 계열은 default export 형태라 as any 캐스팅이 필요할 수 있음
import * as redisStore from 'cache-manager-ioredis';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { KakaoController } from './kakao/kakao.controller';
import { KakaoService } from './kakao/kakao.service';

import { SentimentController } from './controllers/sentiment.controller';
import { SentimentService } from './services/sentiment.service';

import { ReviewController } from './controllers/review.controller';
import { ReviewService } from './services/review.service';

import { SearchController } from './controllers/search.controller';
import { SearchService } from './services/search.service';

import { GptController } from './gpt/gpt.controller';
import { GptService } from './gpt/gpt.service';

import { KeywordController } from './controllers/keyword.controller';
import { KeywordExtractionService } from './services/keyword-extraction.service';
import { KeywordMapService } from './services/keyword-map.service';

import { RedisController } from './controllers/redis.controller';

import { Review } from './entities/review.entity';
import { Restaurant } from './entities/restaurant.entity';

// ✅ 인증 모듈 추가 (명세: /auth/signup, /auth/login, /auth/me, /auth/logout)
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 1) .env 로드 (전역)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2) HTTP 모듈
    HttpModule,

    // 3) DB 연결 (env 기반)
    TypeOrmModule.forRoot({
      // .env 예시: DB_TYPE=sqlite, DB_PATH=./dev.sqlite
      type: (process.env.DB_TYPE as any) || 'sqlite',
      database: process.env.DB_PATH || 'meokkitlist.sqlite',
      entities: [Review, Restaurant],
      // 개발에서는 true, 운영에서는 false 권장
      synchronize:
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'dev' ||
        process.env.NODE_ENV === undefined
          ? true
          : false,
      autoLoadEntities: true,
    }),

    // 4) 엔티티 레포지토리 등록
    TypeOrmModule.forFeature([Review, Restaurant]),

    // 5) 전역 캐시 (Redis backend)
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        // nest v10 + cache-manager-ioredis 조합에서는 any 캐스팅이 안전
        store: redisStore as any,
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        ttl: 60 * 60, // seconds (1시간)
      }),
    }),

    // 6) Redis 클라이언트 (pub/sub, direct 사용 시)
    RedisModule.forRootAsync({
      useFactory: async (): Promise<RedisModuleOptions> => ({
        type: 'single',
        options: {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
          password: process.env.REDIS_PASSWORD || undefined,
          // ioredis in Nest 추천 설정
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        },
      }),
    }),

    // 7) 인증 모듈
    AuthModule,
  ],

  controllers: [
    AppController,
    KakaoController,
    SentimentController,
    ReviewController,
    SearchController,
    GptController,
    KeywordController,
    RedisController,
  ],

  providers: [
    AppService,
    KakaoService,
    SentimentService,
    ReviewService,
    SearchService,
    GptService,
    KeywordExtractionService,
    KeywordMapService,
  ],

  exports: [KeywordMapService],
})
export class AppModule {}
