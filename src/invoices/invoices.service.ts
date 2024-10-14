import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Error } from 'src/common/enums/error.enum';
import { Paginated } from 'src/common/pagination/pagination.dto';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { SortOrder } from 'src/common/types/SortOrder';
import { checkEmptyRequestBody } from 'src/common/utils/checkEmptyRequestBody';
import { Company, CompanyId } from 'src/companies/entities/company.entity';
import { Customer, CustomerId } from 'src/customers/entities/customer.entity';
import { CreateInvoiceItemDto } from 'src/invoice-items/dto/create-invoice-item.dto';
import { InvoiceItemsService } from 'src/invoice-items/invoice-items.service'; // Import the InvoiceItemsService
import { DataSource, Repository } from 'typeorm';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice, InvoiceId } from './entities/invoice.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly paginationService: PaginationService,
    private readonly dataSource: DataSource,
    private readonly invoiceItemsService: InvoiceItemsService,
  ) {}

  async createInvoice(
    createInvoiceDto: CreateInvoiceDto,
  ): Promise<InvoiceId | null> {
    const customerId: CustomerId = createInvoiceDto.customerId;
    const companyId: CompanyId = createInvoiceDto.companyId;

    // Validate customer and company existence
    const customerExists = await this.dataSource.manager.findOne(Customer, {
      where: { id: customerId },
    });
    if (!customerExists) {
      throw new HttpException(Error.CUSTOMER_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    const companyExists = await this.dataSource.manager.findOne(Company, {
      where: { id: companyId },
    });
    if (!companyExists) {
      throw new HttpException(Error.COMPANY_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    try {
      const { items, ...invoiceData } = createInvoiceDto;
      // Create and save invoice
      const invoice = await this.invoiceRepository.create({
        ...invoiceData,
        company: { id: companyId },
        customer: { id: customerId },
      });
      const savedInvoice = await this.invoiceRepository.save(invoice);

      if (!savedInvoice || !savedInvoice.id) {
        throw new HttpException(
          Error.INVOICE_NOT_FOUND,
          HttpStatus.BAD_REQUEST,
        );
      }

      for (const item of items) {
        await this.invoiceItemsService.createInvoiceItem(item, savedInvoice.id);
      }

      return savedInvoice.id;
    } catch (error) {
      console.error('Error during transaction:', error);
      throw new HttpException(
        Error.CREATE_INVOICE_FAILED + ': ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getInvoices(
    page: number,
    limit: number,
    companyId?: CompanyId,
    customerId?: CustomerId,
    archived?: boolean,
    draft?: boolean,
    currency?: string,
    sortBy?: string,
    order: SortOrder = 'ASC',
  ): Promise<Paginated<Invoice> | null> {
    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.company', 'company')
      .leftJoinAndSelect('invoice.customer', 'customer');

    // Apply filters to the query builder
    if (companyId) {
      queryBuilder.andWhere('invoice.companyId = :companyId', { companyId });
    }
    if (customerId) {
      queryBuilder.andWhere('invoice.customerId = :customerId', { customerId });
    }
    if (archived === undefined) {
      archived = false;
    }
    queryBuilder.andWhere('invoice.isArchived = :archived', { archived });

    if (draft !== undefined) {
      queryBuilder.andWhere('invoice.markAsDraft = :draft', { draft });
    }
    if (currency) {
      queryBuilder.andWhere('LOWER(invoice.currency) = LOWER(:currency)', {
        currency: currency.toLowerCase(),
      });
    }

    // Apply sorting if provided, otherwise default to newest first (createdAt DESC)
    if (sortBy) {
      const validSortFields = [
        'createdAt',
        'totalAmount',
        'customerName',
        'companyName',
      ];
      if (validSortFields.includes(sortBy)) {
        const sortField =
          sortBy === 'customerName'
            ? 'customer.name'
            : sortBy === 'companyName'
              ? 'company.name'
              : `invoice.${sortBy}`;
        queryBuilder.orderBy(sortField, order);
      }
    } else {
      // Default sorting to createdAt DESC if no sortBy is provided
      queryBuilder.orderBy('invoice.createdAt', 'DESC');
    }
    // Use the pagination service to paginate the query builder
    return this.paginationService.paginate(queryBuilder, page, limit);
  }

  async getInvoice(id: InvoiceId): Promise<Invoice | null> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['company', 'customer', 'items'],
    });

    if (!invoice) {
      throw new HttpException(Error.INVOICE_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    return invoice;
  }

  async updateInvoice(
    invoiceId: InvoiceId,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<InvoiceId | null> {
    checkEmptyRequestBody(updateInvoiceDto);

    // Fetch the existing invoice
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new HttpException(Error.INVOICE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Update the invoice
    Object.assign(invoice, updateInvoiceDto);

    // Handle invoice items
    if (updateInvoiceDto.items && updateInvoiceDto.items.length > 0) {
      const items = updateInvoiceDto.items;

      const updatedItemIds: string[] = [];

      for (const item of items) {
        if (item.id) {
          // Update existing item
          await this.invoiceItemsService.updateInvoiceItem(item.id, item);
          updatedItemIds.push(item.id);
        } else {
          // Create new item
          const transformedItem: CreateInvoiceItemDto = {
            description: item.description,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
          };

          const newItem = await this.invoiceItemsService.createInvoiceItem(
            transformedItem,
            invoiceId,
          );

          updatedItemIds.push(newItem.id);
        }
      }

      // Handle removal of items
      const itemsToRemove = invoice.items.filter(
        (item) => !updatedItemIds.includes(item.id),
      );

      for (const itemToRemove of itemsToRemove) {
        await this.invoiceItemsService.deleteInvoiceItem(itemToRemove.id);
      }
    }

    // Save the updated invoice
    await this.invoiceRepository.save(invoice);

    return invoice.id;
  }

  async deleteInvoice(invoiceId: InvoiceId): Promise<InvoiceId | null> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new HttpException(Error.INVOICE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Get Invoice Items
    const items = invoice.items;

    if (items && items.length > 0) {
      for (const item of items) {
        await this.invoiceItemsService.removeInvoiceItem(item.id);
      }
    }

    invoice.isArchived = true;

    await this.invoiceRepository.save(invoice);

    return invoice.id;
  }

  async restoreInvoice(invoiceId: InvoiceId): Promise<InvoiceId | null> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new HttpException(Error.INVOICE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Get Invoice Items
    const items = invoice.items;

    if (items && items.length > 0) {
      for (const item of items) {
        await this.invoiceItemsService.restoreInvoiceItem(item.id);
      }
    }

    invoice.isArchived = false;

    await this.invoiceRepository.save(invoice);

    return invoice.id;
  }
}

/**
 * company name: Tech Innovators GmbH
 * company id: 6763e8c4-3992-4fc9-bd6a-2d33450562b8
 *
 * customer name: Anna Smith Cherries
 * customer id: 1d26f5f9-7476-41e2-841d-ef094c50e6d0,
 *
 * invoice created: b95ad732-9108-477f-bf0b-ef194a05aaf3
 * new invoice created: 0eb86aec-70b3-4fbe-b92c-90ffb3a13cfa
 */
