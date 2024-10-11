import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Response } from 'express';
import { CustomRequest } from 'src/common/types/CustomRequest';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: CustomRequest, res: Response, next: NextFunction) {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      req.user = payload; // Set user on the request
      next();
    } catch (error) {
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
