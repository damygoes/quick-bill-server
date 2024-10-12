import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Error } from 'src/common/enums/error.enum';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: (req) => {
        return req.cookies['accessToken']; // Extract token from cookies
      },
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.usersService.getUserWithEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException(Error.USER_NOT_FOUND);
    }
    return user; // This user will be attached to the request object
  }
}
