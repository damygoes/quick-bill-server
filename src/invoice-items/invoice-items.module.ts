import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoiceItemsService } from './invoice-items.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceItem]),
    forwardRef(() => CompaniesModule), // use forwardRef to resolve circular dependency
    PaginationModule,
  ],
  exports: [TypeOrmModule, InvoiceItemsService],
  controllers: [],
  providers: [InvoiceItemsService],
})
export class InvoiceItemsModule {}
