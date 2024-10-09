import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestOtpDto } from 'src/otp/dto/request-otp.dto';
import { VerifyOtpDto } from 'src/otp/dto/verify-otp.dto';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Request an OTP' })
  @ApiBody({
    description: 'The email of the user requesting an OTP',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent to email',
  })
  @Post('request-otp')
  async requestOTP(@Body() requestOtpDto: RequestOtpDto) {
    await this.authService.requestOTP(requestOtpDto.email);
    return { message: 'OTP sent to your email.' };
  }

  @ApiOperation({ summary: 'Login with OTP' })
  @ApiBody({
    description: 'The email and OTP to verify',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        otp: { type: 'string', example: '123456' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    schema: {
      example: {
        accessToken: 'jwt-token-here',
        refreshToken: 'refresh-token-here',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('login')
  async loginWithOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    const isValid = await this.authService.verifyOTP(
      verifyOtpDto.email,
      verifyOtpDto.otp,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const accessToken = this.authService.generateAccessToken(
      verifyOtpDto.email,
    );
    const refreshToken = await this.authService.generateAndStoreRefreshToken(
      verifyOtpDto.email,
    );
    return { accessToken, refreshToken };
  }
}
