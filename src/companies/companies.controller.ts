import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @ApiOperation({ summary: 'Create a new company' })
  @ApiBody({
    description: 'The company details',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Company Name' },
        address: { type: 'string', example: 'Company Address' },
        email: { type: 'string', example: 'company@example.com' },
        phone: { type: 'string', example: '1234567890' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Company created',
    schema: {
      example: {
        id: 1,
        name: 'Company Name',
        address: 'Company Address',
        email: 'company@example.com',
        phone: '1234567890',
      },
    },
  })
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(+id, updateCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(+id);
  }
}
