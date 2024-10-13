import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { InvoiceItemsModule } from 'src/invoice-items/invoice-items.module';
import { UsersModule } from 'src/users/users.module';
import { Invoice } from './entities/invoice.entity';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice]),
    UsersModule,
    forwardRef(() => CompaniesModule), // use forwardRef to resolve circular dependency
    forwardRef(() => InvoiceItemsModule),
    PaginationModule,
  ],
  exports: [TypeOrmModule, InvoicesService],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
