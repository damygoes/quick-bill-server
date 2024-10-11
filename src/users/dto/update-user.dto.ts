import { PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { validateUserUpdateDto } from 'src/common/decorators/validateUserUpdateDto.decorator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @validateUserUpdateDto()
  firstName?: string;

  @IsOptional()
  @validateUserUpdateDto()
  lastName?: string;

  @IsOptional()
  @validateUserUpdateDto()
  email?: string;

  @IsOptional()
  profilePicture?: string;
}
