import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CompaniesModule } from './companies/companies.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { InvoiceItemsModule } from './invoice-items/invoice-items.module';
import { InvoicesModule } from './invoices/invoices.module';
import { OTPModule } from './otp/otp.module';
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
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
