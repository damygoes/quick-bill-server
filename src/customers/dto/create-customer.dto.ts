import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AddressDto } from 'src/common/dto/address.dto';
import { CompanyId } from 'src/companies/entities/company.entity';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsNotEmpty()
  address: AddressDto;

  @IsUUID()
  @IsNotEmpty()
  customerOf: CompanyId;
}
