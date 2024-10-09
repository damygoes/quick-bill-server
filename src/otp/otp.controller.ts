import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OTPService } from './otp.service';

@ApiTags('Authentication')
@Controller('auth')
export class OtpController {
  constructor(private readonly otpService: OTPService) {}

  @ApiOperation({ summary: 'Request an OTP' })
  @ApiBody({
    description: 'The email to send the OTP to',
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
    schema: {
      example: {
        message: 'OTP sent to your email.',
      },
    },
  })
  @Post('request-otp')
  async requestOTP(@Body() requestOtpDto: RequestOtpDto) {
    const otp = this.otpService.generateOTP();
    await this.otpService.storeOTP(requestOtpDto.email, otp); // This will also send the OTP via email
    return { message: 'OTP sent to your email.' };
  }

  @ApiOperation({ summary: 'Verify an OTP' })
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
    description: 'OTP is valid',
    schema: {
      example: {
        isValid: true,
      },
    },
  })
  @Post('verify-otp')
  async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    const isValid = await this.otpService.verifyOTP(
      verifyOtpDto.email,
      verifyOtpDto.otp,
    );
    return { isValid };
  }
}
