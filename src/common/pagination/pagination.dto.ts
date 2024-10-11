import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export interface Paginated<T> {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  items: T[];
}
