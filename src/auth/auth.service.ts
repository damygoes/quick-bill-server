import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { EmailService } from 'src/email/email.service';
import { OTPService } from 'src/otp/otp.service';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';

dotenv.config();

interface TokenPayload {
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private readonly emailService: EmailService,
    private readonly otpService: OTPService,
    private readonly usersService: UsersService,
  ) {}

  // Generate Access Token
  generateAccessToken(email: string): string {
    const payload: TokenPayload = { email };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRATION,
    });
  }

  // Generate and Store Refresh Token
  async generateAndStoreRefreshToken(email: string): Promise<string> {
    const payload: TokenPayload = { email };
    const refreshTokenExpiryDate = process.env.JWT_REFRESH_EXPIRATION!;
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: refreshTokenExpiryDate,
    });

    const expiryDate = new Date(Date.now() + parseInt(refreshTokenExpiryDate));

    const storedToken = await this.refreshTokenRepository.save({
      token: refreshToken,
      userEmail: email,
      expiresAt: expiryDate,
    });

    return storedToken.token;
  }

  // Verify Access Token
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      }) as TokenPayload;
    } catch (error) {
      console.error('Error verifying access token: ', error);
      return null;
    }
  }

  // Verify Refresh Token
  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      }) as TokenPayload;
    } catch (error) {
      console.error('Error verifying refresh token: ', error);
      return null;
    }
  }

  // Delete Refresh Token
  async deleteRefreshToken(token: string, userEmail: string): Promise<void> {
    try {
      await this.refreshTokenRepository.delete({ token, userEmail });
    } catch (error) {
      console.error('Error deleting refresh token: ', error);
    }
  }

  // Request OTP
  async requestOTP(email: string): Promise<void> {
    let user = await this.usersService.getUserWithEmail(email);

    if (!user) {
      user = await this.usersService.createTemporaryUser({ email });
    }

    // Generate OTP and store it, then send the OTP email
    const otp = this.otpService.generateOTP();
    await this.otpService.storeOTP(email, otp);
  }

  // Verify OTP
  async verifyOTP(email: string, otp: string): Promise<boolean> {
    return await this.otpService.verifyOTP(email, otp);
  }

  // Send OTP
  async sendOTP(email: string, otp: string) {
    await this.emailService.sendOTPEmail(email, otp);
  }
}
