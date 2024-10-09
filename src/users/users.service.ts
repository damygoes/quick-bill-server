import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTemporaryUserDto } from './dto/create-temporary-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  createUser(createUserDto: CreateUserDto) {
    return `This action adds a new user with the following details: ${createUserDto}`;
  }

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

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async getUserWithEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersRepository.save({
      ...user,
      ...updateUserDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
