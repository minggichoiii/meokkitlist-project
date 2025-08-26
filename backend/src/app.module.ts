import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis'; // import RedisModuleOptions
import { CacheModule } from '@nestjs/cache-manager';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load .env variables globally
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'meokkitlist.sqlite',
      entities: [Review, Restaurant],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Review, Restaurant]),

    // Global cache configuration using Redis as backend
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: redisStore,
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        ttl: 60 * 60, // 1 hour cache TTL
      }),
    }),

    // Redis client for pub/sub or direct Redis access
    RedisModule.forRootAsync({
      useFactory: async (): Promise<RedisModuleOptions> => ({
        type: 'single', // use single node Redis
        options: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
          password: process.env.REDIS_PASSWORD || undefined,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        },
      }),
    }),
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
