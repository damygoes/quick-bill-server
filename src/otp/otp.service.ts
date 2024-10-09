import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addMinutes } from 'date-fns';
import { EmailService } from 'src/email/email.service';
import { Repository } from 'typeorm';
import { OTPStore } from './entities/otp.entity';

@Injectable()
export class OTPService {
  constructor(
    @InjectRepository(OTPStore)
    private readonly otpRepository: Repository<OTPStore>,
    private readonly emailService: EmailService,
  ) {}

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async storeOTP(email: string, otp: string): Promise<void> {
    const expiration = addMinutes(
      new Date(),
      parseInt(process.env.OTP_EXPIRATION!),
    );

    await this.otpRepository.save({
      email,
      otp,
      otpExpiration: expiration,
    });

    // Send OTP email to the user

    await this.emailService.sendOTPEmail(email, otp);
  }

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const otpEntry = await this.otpRepository.findOne({ where: { email } });

    if (!otpEntry || !otpEntry.otp || !otpEntry.otpExpiration) {
      return false;
    }

    if (otpEntry.otpExpiration < new Date()) {
      // OTP expired, clean up the record
      await this.otpRepository.update(
        { email },
        { otp: null, otpExpiration: null },
      );
      return false;
    }

    const isValid = otpEntry.otp === otp;
    if (isValid) {
      // Invalidate the OTP after successful verification
      await this.otpRepository.update(
        { email },
        { otp: null, otpExpiration: null },
      );
    }

    return isValid;
  }
}
