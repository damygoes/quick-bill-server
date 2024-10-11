import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Error } from 'src/common/enums/error.enum';
import { AuthGuard } from 'src/common/guards/auth-guard';
import { CompanyOwnershipGuard } from 'src/common/guards/companyOwnership.guard';
import { Paginated } from 'src/common/pagination/pagination.dto';
import { CustomRequest } from 'src/common/types/CustomRequest';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company, CompanyId } from './entities/company.entity';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @ApiOperation({
    summary: 'Get all companies belonging to the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of companies',
    schema: {
      example: {
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
        items: [
          {
            id: 'ff321-1234-1234-1234-1234567890ab',
            name: 'Company One',
            website: 'https://company-one-website.com',
            phone: '1234567890',
            mobile: '9876543210',
            email: 'info@company-one-website.com',
            image: 'company-one-image.jpg',
            industry: 'Retail',
            registrationNumber: 'REG123456',
            address: {
              street: 'Main St',
              number: '123A',
              zip: '12345',
              city: 'Offenburg',
              state: 'Baden-Württemberg',
              country: 'Germany',
            },
            belongsTo: 'ff321-1234-1234-1234-1234567890ab',
            createdAt: '2021-08-01T12:00:00.000Z',
            updatedAt: '2021-08-01T12:00:00.000Z',
          },
          {
            id: 'ff321-1234-1234-1234-1234567890ab',
            name: 'Company Two',
            website: 'https://company-two-website.com',
            phone: '1234567890',
            mobile: '9876543210',
            email: 'info@company-two-website.com',
            image: 'company-two-image.jpg',
            industry: 'Retail',
            registrationNumber: 'REG123456',
            address: {
              street: 'Main St',
              number: '123A',
              zip: '12345',
              city: 'Offenburg',
              state: 'Baden-Württemberg',
              country: 'Germany',
            },
            belongsTo: 'ff321-1234-1234-1234-1234567890ab',
            createdAt: '2021-08-01T12:00:00.000Z',
            updatedAt: '2021-08-01T12:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Companies not found',
    schema: {
      example: {
        statusCode: 404,
        message: Error.COMPANIES_NOT_FOUND,
      },
    },
  })
  @Get()
  @UseGuards(AuthGuard)
  @Get()
  async getCompanies(
    @Request() req: CustomRequest,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Paginated<Company> | null> {
    const currentAuthenticatedUser = req.user;

    if (!currentAuthenticatedUser) {
      throw new NotFoundException(Error.USER_NOT_FOUND);
    }

    // Parse page and limit as numbers to ensure they are valid
    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;

    // Get paginated companies
    return this.companiesService.getCompanies(
      currentAuthenticatedUser.id,
      pageNumber,
      pageSize,
    );
  }

  @ApiOperation({ summary: 'Get details of a company by ID' })
  @ApiResponse({
    status: 200,
    description: 'Company details',
    schema: {
      example: {
        id: 'ff321-1234-1234-1234-1234567890ab',
        name: 'Company Name',
        website: 'https://company-website.com',
        phone: '1234567890',
        mobile: '9876543210',
        email: 'info@company-website.com',
        image: 'company-image.jpg',
        industry: 'Retail',
        registrationNumber: 'REG123456',
        address: {
          street: 'Main St',
          number: '123A',
          zip: '12345',
          city: 'Offenburg',
          state: 'Baden-Württemberg',
          country: 'Germany',
        },
        belongsTo: 'ff321-1234-1234-1234-1234567890ab',
        createdAt: '2021-08-01T12:00:00.000Z',
        updatedAt: '2021-08-01T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
    schema: {
      example: {
        statusCode: 404,
        message: Error.COMPANY_NOT_FOUND,
      },
    },
  })
  @Get(':id')
  @UseGuards(AuthGuard)
  @UseGuards(CompanyOwnershipGuard)
  async getCompany(@Param('id') id: CompanyId): Promise<Company | null> {
    const existingCompany = await this.companiesService.getCompany(id);

    return existingCompany;
  }

  @ApiOperation({ summary: 'Create a new company' })
  @ApiBody({
    description: 'The company details',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Company Name' },
        website: {
          type: 'string',
          example: 'https://company-website.com',
          nullable: true,
        },
        phone: { type: 'string', example: '1234567890', nullable: true },
        mobile: { type: 'string', example: '9876543210', nullable: true },
        email: { type: 'string', example: 'company@example.com' },
        image: { type: 'string', example: 'image-url.jpg', nullable: true },
        industry: { type: 'string', example: 'Retail' },
        registrationNumber: {
          type: 'string',
          example: 'REG123456',
          nullable: true,
        },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string', example: 'Main St' },
            number: { type: 'string', example: '123A' },
            zip: { type: 'string', example: '12345' },
            city: { type: 'string', example: 'Offenburg' },
            state: { type: 'string', example: 'Baden-Württemberg' },
            country: { type: 'string', example: 'Germany' },
          },
        },
      },
      required: ['name', 'email', 'industry', 'address'], // specify required fields
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Company successfully created',
    schema: {
      example: {
        id: 'ff321-1234-1234-1234-1234567890ab',
      },
    },
  })
  @Post()
  @UseGuards(AuthGuard)
  async createCompany(
    @Request() req: CustomRequest,
    @Body() createCompanyDto: CreateCompanyDto,
  ): Promise<CompanyId | null> {
    const currentAuthenticatedUser = req.user;
    return await this.companiesService.createCompany(
      createCompanyDto,
      currentAuthenticatedUser.id,
    );
  }

  @ApiOperation({ summary: 'Update a company by ID' })
  @ApiBody({
    description: 'The company details',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Company Name' },
        website: {
          type: 'string',
          example: 'https://company-website.com',
          nullable: true,
        },
        phone: { type: 'string', example: '1234567890', nullable: true },
        mobile: { type: 'string', example: '9876543210', nullable: true },
        email: { type: 'string', example: 'email@company.com' },
        image: { type: 'string', example: 'image-url.jpg', nullable: true },
        industry: { type: 'string', example: 'Retail' },
        registrationNumber: {
          type: 'string',
          example: 'REG123456',
          nullable: true,
        },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string', example: 'Main St' },
            number: { type: 'string', example: '123A' },
            zip: { type: 'string', example: '12345' },
            city: { type: 'string', example: 'Offenburg' },
            state: { type: 'string', example: 'Baden-Württemberg' },
            country: { type: 'string', example: 'Germany' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Company successfully updated',
    schema: {
      example: {
        id: 'ff321-1234-1234-1234-1234567890ab',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
    schema: {
      example: {
        statusCode: 404,
        message: Error.COMPANY_NOT_FOUND,
      },
    },
  })
  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseGuards(CompanyOwnershipGuard)
  async updateCompany(
    @Param('id') id: CompanyId,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyId | null> {
    return this.companiesService.updateCompany(id, updateCompanyDto);
  }

  @ApiOperation({ summary: 'Delete a company by ID' })
  @ApiResponse({
    status: 200,
    description: 'Company successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
    schema: {
      example: {
        statusCode: 404,
        message: Error.COMPANY_NOT_FOUND,
      },
    },
  })
  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseGuards(CompanyOwnershipGuard)
  async deleteCompany(@Param('id') id: CompanyId): Promise<void> {
    return this.companiesService.deleteCompany(id);
  }
}
