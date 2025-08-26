// src/controllers/review.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { SentimentService } from '../services/sentiment.service';

// ✅ 요청 바디 타입 정의
interface CreateReviewDto {
  text: string;
  restaurant_id: string;
  user_id: string;
  source: 'user' | 'crawl';
}

// ✅ 키워드 확장 요청 DTO
interface ExpandKeywordDto {
  keyword: string;
}

@Controller('review')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly sentimentService: SentimentService,
  ) {}

  @Post('create')
  async createReview(@Body() body: CreateReviewDto) {
    return this.reviewService.createReview(body);
  }

  // ✅ 추가된 키워드 확장 테스트용 엔드포인트
  @Post('expand-keyword')
  async expandKeyword(@Body() body: ExpandKeywordDto) {
    const keywords = await this.sentimentService.expandKeywords(body.keyword);
    return { keywords };
  }
}
