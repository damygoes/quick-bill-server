import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Error } from 'src/common/enums/error.enum';
import { AuthGuard } from 'src/common/guards/authGuard.guard';
import { OwnershipGuard } from 'src/common/guards/ownership-guard';
import { CustomRequest } from 'src/common/types/CustomRequest';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserId } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Get the details of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User details',
    schema: {
      example: {
        id: 'e1234567-1234-1234-1234-1234567890ab',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        profilePicture: 'https://example.com/johndoe.jpg',
        isOnboarded: true,
        createdAt: '2021-08-10T12:00:00.000Z',
        updatedAt: '2021-08-10T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: Error.USER_NOT_FOUND,
  })
  @Get('self')
  @UseGuards(AuthGuard, OwnershipGuard)
  async getAuthenticatedUser(@Request() req: CustomRequest) {
    const currentAuthenticatedUser = req.user;

    return this.usersService.getUserById(currentAuthenticatedUser.id);
  }
  @ApiOperation({ summary: 'Get the details of a user' })
  @ApiResponse({
    status: 200,
    description: 'User details',
    schema: {
      example: {
        id: 'e1234567-1234-1234-1234-1234567890ab',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        profilePicture: 'https://example.com/johndoe.jpg',
        isOnboarded: true,
        createdAt: '2021-08-10T12:00:00.000Z',
        updatedAt: '2021-08-10T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: Error.USER_NOT_FOUND,
  })
  @Get(':userId')
  getUser(@Param('userId') userId: UserId) {
    return this.usersService.getUserById(userId);
  }

  @ApiOperation({ summary: 'Update the details of a user' })
  @ApiBody({
    description: 'The ID of the user to update and the new details',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'Jimmy' },
        lastName: { type: 'string', example: 'Jones' },
        email: { type: 'string', example: 'jimmyJones@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Updated user details',
    schema: {
      example: {
        id: 'e1234567-1234-1234-1234-1234567890ab',
        firstName: 'Jimmy',
        lastName: 'Jones',
        email: 'jimmyJones@example.com',
        profilePicture: 'https://example.com/johndoe.jpg',
        isOnboarded: true,
        createdAt: '2021-08-10T12:00:00.000Z',
        updatedAt: '2021-08-10T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: Error.USER_NOT_FOUND,
  })
  @Patch(':userId')
  @UseGuards(AuthGuard, OwnershipGuard)
  updateUser(
    @Param('userId') userId: UserId,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(userId, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: Error.USER_NOT_FOUND,
  })
  @Delete(':userId')
  @UseGuards(AuthGuard, OwnershipGuard)
  async deleteUser(
    @Request() req: CustomRequest,
    @Param('userId') userId: UserId,
  ): Promise<void> {
    const currentAuthenticatedUser = req.user;

    if (currentAuthenticatedUser.id !== userId) {
      throw new HttpException(
        Error.USER_MODIFICATION_FORBIDDEN,
        HttpStatus.FORBIDDEN,
      );
    }
    return this.usersService.deleteUser(userId);
  }
}
