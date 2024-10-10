import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CompaniesController } from './companies/companies.controller';
import { CompaniesModule } from './companies/companies.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { InvoiceItemsController } from './invoice-items/invoice-items.controller';
import { InvoiceItemsModule } from './invoice-items/invoice-items.module';
import { InvoicesController } from './invoices/invoices.controller';
import { InvoicesModule } from './invoices/invoices.module';
import { OTPModule } from './otp/otp.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    UsersModule,
    CompaniesModule,
    InvoicesModule,
    InvoiceItemsModule,
    OTPModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor(private dataSource: DataSource) {}

  configure(consumer: MiddlewareConsumer) {
    // Apply LoggerMiddleware to all routes
    consumer.apply(LoggerMiddleware).forRoutes('*');

    // Apply AuthMiddleware only to specific routes
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        UsersController,
        CompaniesController,
        InvoicesController,
        InvoiceItemsController,
      );
  }
}
