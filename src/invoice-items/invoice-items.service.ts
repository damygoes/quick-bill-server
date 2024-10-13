import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';
import { InvoiceItem, InvoiceItemId } from './entities/invoice-item.entity';

@Injectable()
export class InvoiceItemsService {
  constructor(
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
  ) {}

  async createInvoiceItem(
    createInvoiceItemDto: CreateInvoiceItemDto,
    invoiceId: InvoiceItemId,
  ): Promise<InvoiceItem> {
    const invoiceItem = this.invoiceItemsRepository.create({
      ...createInvoiceItemDto,
      invoice: { id: invoiceId }, // Link to the invoice
    });
    return await this.invoiceItemsRepository.save(invoiceItem);
  }

  async getInvoiceItem(id: InvoiceItemId): Promise<InvoiceItem | null> {
    const invoiceItem = await this.invoiceItemsRepository.findOne({
      where: { id },
    });
    if (!invoiceItem) {
      throw new NotFoundException(`Invoice item with ID ${id} not found`);
    }
    return invoiceItem;
  }

  async updateInvoiceItem(
    id: InvoiceItemId,
    updateInvoiceItemDto: UpdateInvoiceItemDto,
  ): Promise<InvoiceItem> {
    const invoiceItem = await this.getInvoiceItem(id);
    Object.assign(invoiceItem, updateInvoiceItemDto);
    return await this.invoiceItemsRepository.save(invoiceItem);
  }

  async removeInvoiceItem(id: InvoiceItemId): Promise<void> {
    const invoiceItem = await this.getInvoiceItem(id);
    await this.invoiceItemsRepository.remove(invoiceItem);
  }
}
