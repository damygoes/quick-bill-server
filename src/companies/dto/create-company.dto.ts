import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AddressDto } from 'src/common/dto/address.dto';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsNotEmpty()
  industry: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsNotEmpty()
  address: AddressDto;
}
