import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lon?: number;

  @IsOptional()
  @IsString()
  preview?: string;

  @IsOptional()
  @IsNumber()
  review_count?: number;

  @IsOptional()
  @IsNumber()
  total_score?: number;

  @IsOptional()
  @IsNumber()
  naver_score?: number;
}
