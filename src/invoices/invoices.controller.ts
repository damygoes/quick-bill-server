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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Error } from 'src/common/enums/error.enum';
import { AuthGuard } from 'src/common/guards/authGuard.guard';
import { InvoiceOwnershipGuard } from 'src/common/guards/invoiceOwnership.guard';
import { Paginated } from 'src/common/pagination/pagination.dto';
import { SortOrder } from 'src/common/types/SortOrder';
import { checkEmptyRequestBody } from 'src/common/utils/checkEmptyRequestBody';
import { CompanyId } from 'src/companies/entities/company.entity';
import { CustomerId } from 'src/customers/entities/customer.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice, InvoiceId } from './entities/invoice.entity';
import { InvoicesService } from './invoices.service';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @ApiOperation({
    summary: 'Create a new invoice',
  })
  @ApiBody({
    description: 'Invoice data',
    type: CreateInvoiceDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully',
    schema: {
      example: {
        id: 'ff321-1234-1234-1234-1234567890ab',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      example: {
        statusCode: 400,
        message: Error.CUSTOMER_ID_REQUIRED,
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Bad request',
    schema: {
      example: {
        statusCode: 401,
        message: Error.COMPANY_ID_REQUIRED,
        error: 'Bad Request',
      },
    },
  })
  @Post()
  @UseGuards(AuthGuard)
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    checkEmptyRequestBody(createInvoiceDto);
    return this.invoicesService.createInvoice(createInvoiceDto);
  }

  @ApiOperation({
    summary: 'Get a list of invoices',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: String,
    description: 'Filter by company ID',
  })
  @ApiQuery({
    name: 'customerId',
    required: false,
    type: String,
    description: 'Filter by customer ID',
  })
  @ApiQuery({
    name: 'archived',
    required: false,
    type: Boolean,
    description: 'Filter by archived status',
  })
  @ApiQuery({
    name: 'draft',
    required: false,
    type: Boolean,
    description: 'Filter by draft status',
  })
  @ApiQuery({
    name: 'currency',
    required: false,
    type: String,
    description: 'Filter by currency',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort by specified field',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sorting order',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of invoices',
    schema: {
      example: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
        items: [
          {
            id: 'b95ad732-9108-477f-bf0b-ef194a05aaf3',
            invoiceNumber: '#TIN1234',
            dueDate: '2024-11-13T11:21:04.658Z',
            subTotal: '1500.00',
            totalAmount: '1785.00',
            vat: '285.00',
            vatPercentage: 19,
            currency: 'EUR',
            isArchived: false,
            markAsDraft: false,
            pdfUrl: 'https://company-website.com/invoices/TIN1234.pdf',
            createdAt: '2024-10-13T10:50:50.606Z',
            updatedAt: '2024-10-13T10:50:50.606Z',
            company: {
              id: '6763e8c4-3992-4fc9-bd6a-2d33450562b8',
              name: 'Tech Innovators GmbH',
              website: 'https://techinnovators.com',
              phone: '+49 30 9876543',
              mobile: '+49 170 1234567',
              email: 'contact@techinnovators.com',
              image: 'https://techinnovators.com/images/logo.png',
              industry: 'Technology',
              registrationNumber: 'HRB654321',
              address: {
                zip: '10115',
                city: 'Berlin',
                state: 'Berlin',
                number: '15',
                street: 'Berliner Straße',
                country: 'Germany',
              },
              belongsTo: '3bc5907a-6632-4e0f-8888-0e16a2789b62',
              createdAt: '2024-10-11T16:06:29.979Z',
              updatedAt: '2024-10-11T16:06:29.979Z',
            },
            customer: {
              id: '1d26f5f9-7476-41e2-841d-ef094c50e6d0',
              name: 'Anna Smith Cherries',
              email: 'anna.smith@example.com',
              mobile: '+1-202-555-0123',
              phone: '+1-202-555-0199',
              address: {
                zip: '11121',
                city: 'London',
                state: 'London',
                number: '0011',
                street: 'Kings Square',
                country: 'United Kingdom',
              },
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No invoices found',
    schema: {
      example: {
        statusCode: 404,
        message: 'No invoices found',
        error: 'Not Found',
      },
    },
  })
  @Get()
  @UseGuards(AuthGuard)
  async getInvoices(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('companyId') companyId?: CompanyId,
    @Query('customerId') customerId?: CustomerId,
    @Query('archived') archived?: boolean,
    @Query('draft') draft?: boolean,
    @Query('currency') currency?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order: SortOrder = 'ASC',
  ): Promise<Paginated<Invoice> | null> {
    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;

    return await this.invoicesService.getInvoices(
      pageNumber,
      pageSize,
      companyId,
      customerId,
      archived,
      draft,
      currency,
      sortBy,
      order,
    );
  }

  @ApiOperation({
    summary: 'Get the details of an invoice',
  })
  @ApiQuery({
    name: 'invoiceId',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice details',
    schema: {
      example: {
        id: 'b95ad732-9108-477f-bf0b-ef194a05aaf3',
        invoiceNumber: '#TIN1234',
        dueDate: '2024-11-13T11:21:04.658Z',
        subTotal: '1500.00',
        totalAmount: '1785.00',
        vat: '285.00',
        vatPercentage: 19,
        currency: 'EUR',
        isArchived: false,
        markAsDraft: false,
        pdfUrl: 'https://company-website.com/invoices/TIN1234.pdf',
        createdAt: '2024-10-13T10:50:50.606Z',
        updatedAt: '2024-10-13T10:50:50.606Z',
        company: {
          id: '6763e8c4-3992-4fc9-bd6a-2d33450562b8',
          name: 'Tech Innovators GmbH',
          website: 'https://techinnovators.com',
          phone: '+49 30 9876543',
          mobile: '+49 170 1234567',
          email: 'contact@techinnovators.com',
          image: 'https://techinnovators.com/images/logo.png',
          industry: 'Technology',
          registrationNumber: 'HRB654321',
          address: {
            zip: '10115',
            city: 'Berlin',
            state: 'Berlin',
            number: '15',
            street: 'Berliner Straße',
            country: 'Germany',
          },
          belongsTo: '3bc5907a-6632-4e0f-8888-0e16a2789b62',
          createdAt: '2024-10-11T16:06:29.979Z',
          updatedAt: '2024-10-11T16:06:29.979Z',
        },
        customer: {
          id: '1d26f5f9-7476-41e2-841d-ef094c50e6d0',
          name: 'Anna Smith Cherries',
          email: 'anna.smith@example.com',
          mobile: '+1-202-555-0123',
          phone: '+1-202-555-0199',
          address: {
            zip: '11121',
            city: 'London',
            state: 'London',
            number: '0011',
            street: 'Kings Square',
            country: 'United Kingdom',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      example: {
        statusCode: 400,
        message: Error.INVOICE_ID_REQUIRED,
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found',
    schema: {
      example: {
        statusCode: 404,
        message: Error.INVOICE_NOT_FOUND,
        error: 'Not Found',
      },
    },
  })
  @Get(':invoiceId')
  @UseGuards(AuthGuard)
  getInvoice(@Param('invoiceId') invoiceId: InvoiceId) {
    if (!invoiceId) {
      throw new NotFoundException({
        statusCode: 400,
        message: Error.INVOICE_ID_REQUIRED,
        error: 'Bad Request',
      });
    }
    return this.invoicesService.getInvoice(invoiceId);
  }

  @ApiOperation({
    summary: 'Update an invoice',
  })
  @ApiBody({
    description: 'Invoice data',
    type: UpdateInvoiceDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice updated successfully',
    schema: {
      example: {
        id: 'b95ad732-9108-477f-bf0b-ef194a05aaf3',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      example: {
        statusCode: 400,
        message: Error.INVOICE_ID_REQUIRED,
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Bad request',
    schema: {
      example: {
        statusCode: 401,
        message: Error.COMPANY_ID_REQUIRED,
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found',
    schema: {
      example: {
        statusCode: 404,
        message: Error.INVOICE_NOT_FOUND,
        error: 'Not Found',
      },
    },
  })
  @Patch(':invoiceId/companies/:companyId')
  @UseGuards(AuthGuard)
  @UseGuards(InvoiceOwnershipGuard)
  updateInvoice(
    @Param('invoiceId') invoiceId: InvoiceId,
    @Param('companyId') companyId: CompanyId,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.updateInvoice(invoiceId, updateInvoiceDto);
  }

  @ApiOperation({
    summary: 'Delete an invoice',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice deleted successfully',
    schema: {
      example: {
        id: 'b95ad732-9108-477f-bf0b-ef194a05aaf3',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      example: {
        statusCode: 400,
        message: Error.INVOICE_ID_REQUIRED,
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found',
    schema: {
      example: {
        statusCode: 404,
        message: Error.INVOICE_NOT_FOUND,
        error: 'Not Found',
      },
    },
  })
  @Delete(':invoiceId')
  deleteInvoice(@Param('invoiceId') invoiceId: InvoiceId) {
    return this.invoicesService.deleteInvoice(invoiceId);
  }

  @ApiOperation({
    summary: 'Restore an invoice',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice restored successfully',
    schema: {
      example: {
        id: 'b95ad732-9108-477f-bf0b-ef194a05aaf3',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      example: {
        statusCode: 400,
        message: Error.INVOICE_ID_REQUIRED,
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found',
    schema: {
      example: {
        statusCode: 404,
        message: Error.INVOICE_NOT_FOUND,
        error: 'Not Found',
      },
    },
  })
  @Get('restore/:invoiceId')
  restoreInvoice(@Param('invoiceId') invoiceId: InvoiceId) {
    return this.invoicesService.restoreInvoice(invoiceId);
  }
}
