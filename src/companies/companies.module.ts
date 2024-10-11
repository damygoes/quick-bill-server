import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { UsersModule } from 'src/users/users.module';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company]), UsersModule, PaginationModule],
  exports: [TypeOrmModule],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
