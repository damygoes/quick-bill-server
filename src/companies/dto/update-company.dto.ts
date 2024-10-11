import { PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { validateCompanyUpdateDto } from 'src/common/decorators/validateCompanyUpdateDto.decorator';
import { AddressDto } from 'src/common/dto/address.dto';
import { CreateCompanyDto } from './create-company.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @IsOptional()
  @validateCompanyUpdateDto()
  name?: string;

  @IsOptional()
  @validateCompanyUpdateDto()
  website?: string;

  @IsOptional()
  @validateCompanyUpdateDto()
  phone?: string;

  @IsOptional()
  @validateCompanyUpdateDto()
  mobile?: string;

  @IsOptional()
  @validateCompanyUpdateDto()
  email?: string;

  @IsOptional()
  @validateCompanyUpdateDto()
  image?: string;

  @IsOptional()
  @validateCompanyUpdateDto()
  industry?: string;

  @IsOptional()
  @validateCompanyUpdateDto()
  registrationNumber?: string;

  @IsOptional()
  @validateCompanyUpdateDto()
  address?: AddressDto;
}
