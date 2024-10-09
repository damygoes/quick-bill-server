import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({
    description: 'The email of the user attempting to login',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
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
  async login(@Body('email') email: string) {
    const accessToken = this.authService.generateAccessToken(email);
    const refreshToken =
      await this.authService.generateAndStoreRefreshToken(email);
    return { accessToken, refreshToken };
  }

  @ApiOperation({ summary: 'Refresh the access token' })
  @ApiBody({
    description: 'The refresh token issued during login',
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'refresh-token-here' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'New access token generated',
    schema: {
      example: {
        accessToken: 'new-jwt-token-here',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    const tokenPayload = this.authService.verifyRefreshToken(refreshToken);
    if (!tokenPayload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.authService.generateAccessToken(
      tokenPayload.email,
    );
    return { accessToken };
  }
}
