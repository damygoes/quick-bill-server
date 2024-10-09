import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateTemporaryUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
