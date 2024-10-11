import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class PaginationService {
  async paginate<T>(
    repository: Repository<T>,
    page: number,
    limit: number,
    whereCondition: object = {},
  ): Promise<{
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    items: T[];
  }> {
    const offset = (page - 1) * limit;

    // Fetch the items and the total count
    const [items, totalItems] = await repository.findAndCount({
      where: whereCondition,
      take: limit,
      skip: offset,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    return {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
      items,
    };
  }
}
