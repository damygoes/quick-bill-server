import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
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
  async loginWithOTP(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Res() response: Response,
  ) {
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

    // Set tokens in httpOnly cookies
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false, // Use 'secure: true' in production with HTTPS
      sameSite: 'strict',
      maxAge: parseInt(process.env.JWT_EXPIRATION) * 1000, // 1 hour (3600s)
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // Use 'secure: true' in production with HTTPS
      sameSite: 'strict',
      maxAge: parseInt(process.env.JWT_REFRESH_EXPIRATION) * 1000, // 1 day (86400s)
    });

    return response.json({ message: 'Login successful' });
  }

  @ApiOperation({ summary: 'Refresh Access Token' })
  @ApiBody({
    description: 'The refresh token to generate a new access token',
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'refresh-token-here' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully refreshed access token',
    schema: {
      example: {
        accessToken: 'jwt-token',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('refresh-token')
  async refreshToken(
    @Body() body: { refreshToken: string },
    @Res() response: Response,
  ) {
    const newAccessToken =
      await this.authService.generateAccessTokenFromRefreshToken(
        body.refreshToken,
      );

    response.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: false, // Use 'secure: true' in production with HTTPS
      sameSite: 'strict',
      maxAge: parseInt(process.env.JWT_EXPIRATION) * 1000, // 1 hour (3600s)
    });

    return response.json({ accessToken: newAccessToken });
  }

  @ApiOperation({ summary: 'Logout' })
  @ApiBody({
    description: 'Clears the access and refresh tokens',
    schema: {
      type: 'object',
      properties: {},
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
  })
  @Post('logout')
  async logout(@Req() request: Request, @Res() response: Response) {
    const accessToken = request.cookies.accessToken;
    if (!accessToken) {
      throw new UnauthorizedException('No access token found');
    }

    // Optionally verify the access token to get user information
    const decoded = this.authService.verifyAccessToken(accessToken);

    if (!decoded) {
      // If the access token is invalid or expired, you can choose to still clear the cookies
      response.clearCookie('accessToken');
      response.clearCookie('refreshToken');
      return response.status(200).json({ message: 'Logged out successfully' });
    }

    // Proceed to clear cookies
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');

    return response.status(200).json({ message: 'Logged out successfully' });
  }
}
