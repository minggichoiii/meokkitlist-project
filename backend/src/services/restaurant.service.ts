import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as csvParser from 'csv-parser';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  async uploadCsv(filePath: string): Promise<{ inserted: number }> {
    const rows: Record<string, any>[] = [];

    // ✅ CSV 읽기
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(path.resolve(filePath))
        .pipe(csvParser())
        .on('data', (row: any) => rows.push(row))
        .on('end', () => resolve())
        .on('error', (err: any) => reject(err));
    });

    // ✅ 숫자 변환 헬퍼
 const toNum = (v: any): number | undefined =>
  v === undefined || v === null || v === '' || isNaN(Number(v))
    ? undefined
    : Number(v);


    // ✅ rows 전체를 한 번에 create
    const entities: Restaurant[] = this.restaurantRepo.create(
  rows.map((row) => ({
    name: String(row.name ?? '').trim(),
    address: String(row.address ?? '').trim(),
    lat: toNum(row.lat),
    lon: toNum(row.lon),
    keywords: row.keywords
      ? String(row.keywords)
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      : [],
    review_count: toNum(row.review_count) ?? 0,
    total_score: toNum(row.total_score) ?? 0,
    naver_score: toNum(row.naver_score) ?? 0,
    preview: row.preview ?? undefined, // ✅ undefined 사용
  })),
);


    // ✅ DB 저장
    await this.restaurantRepo.save(entities);

    return { inserted: entities.length };
  }
}
