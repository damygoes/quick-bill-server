import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/users/users.service';
import { Error } from '../enums/error.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tokenUser = request.user;

    if (!tokenUser || !tokenUser.email) {
      throw new UnauthorizedException(Error.USER_NOT_FOUND);
    }

    const fullUser = await this.usersService.getUserWithEmail(tokenUser.email);
    if (!fullUser) {
      throw new UnauthorizedException(Error.USER_NOT_FOUND);
    }

    // Attach the full user (with ID) to the request object
    request.user = fullUser;

    return true;
  }
}
