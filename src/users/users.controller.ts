import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OwnershipGuard } from 'src/common/guards/ownership-guard';
import { CustomRequest } from 'src/types/CustomRequest';
import { UpdateUserDto } from './dto/update-user.dto';
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
    description: 'User not found',
  })
  @Get('self')
  @UseGuards(OwnershipGuard)
  async getAuthenticatedUser(@Request() req: CustomRequest) {
    const currentUser = req.user;

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    return this.usersService.getUserById(currentUser.id);
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
    description: 'User not found',
  })
  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.getUserById(id);
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
    description: 'User not found',
  })
  @Patch(':id')
  @UseGuards(OwnershipGuard)
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @Delete(':id')
  @UseGuards(OwnershipGuard)
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
