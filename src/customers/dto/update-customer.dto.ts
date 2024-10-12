import { OmitType, PartialType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { validateCustomerUpdateDto } from 'src/common/decorators/validateCustomerUpdateDto.decorator';
import { AddressDto } from 'src/common/dto/address.dto';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(
  OmitType(CreateCustomerDto, ['customerOf'] as const),
) {
  @IsString()
  @IsOptional()
  @validateCustomerUpdateDto()
  name?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  @validateCustomerUpdateDto()
  email?: string;

  @IsString()
  @IsOptional()
  @validateCustomerUpdateDto()
  mobile?: string;

  @IsString()
  @IsOptional()
  @validateCustomerUpdateDto()
  phone?: string;

  @IsOptional()
  @validateCustomerUpdateDto()
  address?: AddressDto;
}
