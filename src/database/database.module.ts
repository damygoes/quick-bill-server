import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { Company } from 'src/companies/entities/company.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { InvoiceItem } from 'src/invoice-items/entities/invoice-item.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { OTPStore } from 'src/otp/entities/otp.entity';
import { User } from 'src/users/entities/user.entity';

config({
  path: ['.env', '.env.production', '.env.local'],
});

const dbHost =
  process.env.ENV === 'development'
    ? process.env.DB_DEV_HOST
    : process.env.DB_PROD_HOST;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Ensures that the ConfigModule is available throughout the app
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: dbHost,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true, // Development use only
      ssl: {
        rejectUnauthorized: false,
      },
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([
      User,
      Company,
      Customer,
      Invoice,
      InvoiceItem,
      RefreshToken,
      OTPStore,
    ]), // Add repositories or entities here
  ],
})
export class DatabaseModule {}
