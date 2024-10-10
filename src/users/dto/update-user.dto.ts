import { PartialType } from '@nestjs/swagger';
import { IsOptional, ValidateIf } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @ValidateIf((o) => o.firstName || o.lastName || o.email || o.profilePicture)
  firstName?: string;

  @IsOptional()
  @ValidateIf((o) => o.firstName || o.lastName || o.email || o.profilePicture)
  lastName?: string;

  @IsOptional()
  @ValidateIf((o) => o.firstName || o.lastName || o.email || o.profilePicture)
  email?: string;

  @IsOptional()
  profilePicture?: string;
}
