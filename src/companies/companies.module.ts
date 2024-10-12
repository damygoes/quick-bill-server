import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { CustomersModule } from 'src/customers/customers.module';
import { UsersModule } from 'src/users/users.module';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company]),
    UsersModule,
    forwardRef(() => CustomersModule), // use forwardRef to resolve circular dependency
    PaginationModule,
  ],
  exports: [TypeOrmModule, CompaniesService],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
