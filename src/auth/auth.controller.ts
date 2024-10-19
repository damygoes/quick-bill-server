import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { RequestOtpDto } from 'src/otp/dto/request-otp.dto';
import { VerifyOtpDto } from 'src/otp/dto/verify-otp.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

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
  @HttpCode(200)
  @Post('request-otp')
  async requestOTP(@Body() requestOtpDto: RequestOtpDto) {
    await this.authService.requestOTP(requestOtpDto.email);
    return { status: 200, message: 'OTP sent to your email.' };
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

    // Fetch the user details including userId
    const user = await this.usersService.getUserWithEmail(verifyOtpDto.email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate access token and refresh token using user.id
    const accessToken = this.authService.generateAccessToken(
      user.email,
      user.id,
    );
    const refreshToken = await this.authService.generateAndStoreRefreshToken(
      user.email,
      user.id,
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

    return response.json({ status: 200, message: 'Login successful' });
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
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    try {
      const newAccessToken =
        await this.authService.generateAccessTokenFromRefreshToken(
          refreshToken,
        );

      // Send the new access token back as a cookie
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: false, // Set true in production
        sameSite: 'strict',
        maxAge: parseInt(process.env.JWT_EXPIRATION) * 1000,
      });

      return res.json({ message: 'Token refreshed successfully' });
    } catch (error) {
      console.log('error', error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
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
