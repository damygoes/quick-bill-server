import { PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { InvoiceId } from 'src/invoices/entities/invoice.entity';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export class UpdateInvoiceItemDto extends PartialType(CreateInvoiceItemDto) {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  totalPrice?: number;

  @IsString()
  @IsOptional()
  invoice?: { id: InvoiceId };
}
