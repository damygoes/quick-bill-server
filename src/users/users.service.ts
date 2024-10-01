import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return `This action adds a new user with the following details: ${createUserDto}`;
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new Error('User not found');
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
