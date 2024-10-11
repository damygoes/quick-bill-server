import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Error } from 'src/common/enums/error.enum';
import { checkEmptyRequestBody } from 'src/common/utils/checkEmptyRequestBody';
import { Repository } from 'typeorm';
import { CreateTemporaryUserDto } from './dto/create-temporary-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserId } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createTemporaryUser(
    createTemporaryUserDto: CreateTemporaryUserDto,
  ): Promise<User> {
    const queryRunner =
      this.usersRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email: createTemporaryUserDto.email },
      });

      if (existingUser) {
        await queryRunner.rollbackTransaction();
        return existingUser;
      }

      const newUser = queryRunner.manager.create(User, createTemporaryUserDto);
      await queryRunner.manager.save(User, newUser);
      await queryRunner.commitTransaction();

      return newUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.code === '23505') {
        // Unique violation code for PostgreSQL
        throw new ConflictException('User with this email already exists.');
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserById(id: UserId): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
      relations: ['companies'],
    });

    // Dynamically set isOnboarded based on the companies count
    user.isOnboarded = user.companies.length > 0;

    // Map the companies array to extract only the ids
    const companyIds = user.companies.map((company) => company.id);

    // Remove the full companies data and replace with just company ids
    (user as any).companyIds = companyIds;
    delete (user as any).companies;

    return user;
  }

  async getUserWithEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async updateUser(id: UserId, updateUserDto: UpdateUserDto): Promise<User> {
    checkEmptyRequestBody(updateUserDto);
    const user = await this.getUserById(id);

    if (!user) {
      throw new NotFoundException(Error.USER_NOT_FOUND);
    }

    return this.usersRepository.save({
      ...user,
      ...updateUserDto,
    });
  }

  async deleteUser(id: UserId): Promise<void> {
    const user = await this.getUserById(id);

    if (!user) {
      return null;
    }

    await this.usersRepository.remove(user);

    throw new HttpException('User deleted successfully', HttpStatus.NO_CONTENT);
  }
}
