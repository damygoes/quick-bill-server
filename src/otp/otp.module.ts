import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/email/email.module';
import { OTPStore } from './entities/otp.entity';
import { OtpController } from './otp.controller';
import { OTPService } from './otp.service';

@Module({
  imports: [TypeOrmModule.forFeature([OTPStore]), EmailModule],
  controllers: [OtpController],
  providers: [OTPService],
  exports: [OTPService],
})
export class OTPModule {}
