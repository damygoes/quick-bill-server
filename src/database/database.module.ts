import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { join } from 'path';
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
      entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
      synchronize: true, // Development use only
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    TypeOrmModule.forFeature([User]), // Add repositories or entities here if needed
  ],
})
export class DatabaseModule {}
