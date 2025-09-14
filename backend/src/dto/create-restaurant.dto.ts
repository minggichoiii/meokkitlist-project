import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRestaurantDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lon: number | null;

  @IsOptional()
  @IsString()
  preview?: string | null;

  @IsOptional()
  review_count?: number;

  @IsOptional()
  total_score?: number;

  @IsOptional()
  naver_score?: number;

  @IsOptional()
  keywords?: string[] | null;
}
