import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Error } from 'src/common/enums/error.enum';
import { AuthGuard } from 'src/common/guards/authGuard.guard';
import { CustomerOwnershipGuard } from 'src/common/guards/customerOwnership.guard';
import { Paginated } from 'src/common/pagination/pagination.dto';
import { CompanyId } from 'src/companies/entities/company.entity';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, CustomerId } from './entities/customer.entity';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @ApiOperation({
    summary: 'Get all customers belonging to a company',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of customers',
    schema: {
      example: {
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
        items: [
          {
            id: 'ff321-1234-1234-1234-1234567890ab',
            name: 'John Doe',
            email: 'johdoe@email.com',
            mobile: '9876543210',
            phone: '1234567890',
            address: {
              street: 'Main St',
              number: '123A',
              zip: '12345',
              city: 'Offenburg',
              state: 'Baden-Württemberg',
              country: 'Germany',
            },
          },
          {
            id: 'ff321-1234-1234-1234-1234567890ac',
            name: 'Jane Doe',
            email: 'janedoe@email.com',
            mobile: '9876543210',
            phone: '1234567890',
            address: {
              street: 'Main St',
              number: '123A',
              zip: '12345',
              city: 'Offenburg',
              state: 'Baden-Württemberg',
              country: 'Germany',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No customers found',
    schema: {
      example: {
        statusCode: 404,
        message: Error.CUSTOMERS_NOT_FOUND,
      },
    },
  })
  @Get(':companyId')
  @UseGuards(AuthGuard, CustomerOwnershipGuard)
  async getCustomers(
    @Param('companyId') companyId: CompanyId,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Paginated<Customer> | null> {
    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;

    const customers = await this.customersService.getCustomers(
      companyId,
      pageNumber,
      pageSize,
    );

    return customers;
  }

  @ApiOperation({ summary: 'Get the details of a customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer details',
    schema: {
      example: {
        id: 'ff321-1234-1234-1234-1234567890ab',
        name: 'John Doe',
        email: 'johndoe@email.com',
        mobile: '9876543210',
        phone: '1234567890',
        address: {
          street: 'Main St',
          number: '123A',
          zip: '12345',
          city: 'Offenburg',
          state: 'Baden-Württemberg',
          country: 'Germany',
        },
        companyIds: ['ff321-1234-1234-1234-1234567890ab'],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: Error.CUSTOMER_NOT_FOUND,
  })
  @Get(':customerId/companies/:companyId')
  @UseGuards(AuthGuard, CustomerOwnershipGuard)
  async getCustomer(
    @Param('customerId') customerId: CustomerId,
    @Param('companyId') companyId: CompanyId,
  ): Promise<Customer | null> {
    const customer = await this.customersService.getCustomer(
      customerId,
      companyId,
    );

    if (!customer) {
      throw new NotFoundException(Error.CUSTOMER_NOT_FOUND);
    }

    return customer;
  }

  @ApiOperation({ summary: 'Create a new customer' })
  @ApiBody({
    description: 'Customer details',
    type: CreateCustomerDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    schema: {
      example: {
        id: 'ff321-1234-1234-1234-1234567890ab',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: Error.CUSTOMER_ALREADY_EXISTS,
  })
  @Post()
  @UseGuards(AuthGuard)
  createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.createCustomer(createCustomerDto);
  }

  @ApiOperation({ summary: 'Update the details of a customer' })
  @ApiBody({
    description: 'The new details of the customer.',
    type: UpdateCustomerDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Updated customer details',
    schema: {
      example: {
        id: 'ff321-1234-1234-1234-1234567890ab',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: Error.CUSTOMER_NOT_FOUND,
  })
  @Patch(':customerId/companies/:companyId')
  @UseGuards(AuthGuard, CustomerOwnershipGuard)
  updateCustomer(
    @Param('customerId') customerId: CustomerId,
    @Param('companyId') companyId: CompanyId,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.updateCustomer(
      customerId,
      companyId,
      updateCustomerDto,
    );
  }

  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({
    status: 204,
    description: 'Customer deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: Error.CUSTOMER_NOT_FOUND,
  })
  @Delete(':customerId/companies/:companyId')
  @UseGuards(AuthGuard, CustomerOwnershipGuard)
  async deleteCustomer(
    @Param('customerId') customerId: CustomerId,
    @Param('companyId') companyId: CompanyId,
  ) {
    const message = await this.customersService.removeCustomerFromCompany(
      customerId,
      companyId,
    );
    return {
      statusCode: HttpStatus.OK,
      message,
    };
  }
}
