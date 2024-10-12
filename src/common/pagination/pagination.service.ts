import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class PaginationService {
  async paginate<T>(
    queryOrRepo: Repository<T> | SelectQueryBuilder<T>,
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

    let items: T[];
    let totalItems: number;

    // Check if the input is a repository or a query builder
    if (queryOrRepo instanceof Repository) {
      // Handle Repository case
      [items, totalItems] = await queryOrRepo.findAndCount({
        where: whereCondition,
        take: limit,
        skip: offset,
      });
    } else if (queryOrRepo instanceof SelectQueryBuilder) {
      // Handle QueryBuilder case
      [items, totalItems] = await queryOrRepo
        .skip(offset)
        .take(limit)
        .getManyAndCount();
    } else {
      throw new Error('Invalid query or repository provided');
    }

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
