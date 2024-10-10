import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Authenticated user
    const { id } = request.params; // User ID from route parameters

    // Fetch user from the database using email
    const dbUser: User = await this.usersService.getUserWithEmail(user.email);

    if (!dbUser) {
      throw new ForbiddenException('User not found.');
    }

    // If the route does not contain an id (like for /users/self), allow access
    if (id && dbUser.id !== id) {
      throw new ForbiddenException(
        "You don't have permission to modify this user",
      );
    }

    return true; // Grant access if IDs match or if no ID is provided
  }
}
