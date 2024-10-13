import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateInvoiceItemDto } from 'src/invoice-items/dto/create-invoice-item.dto';

export const requiredFieldsForInvoiceCreation = [
  'invoiceNumber',
  'dueDate',
  'subTotal',
  'totalAmount',
  'vat',
  'vatPercentage',
  'currency',
  'customerId',
  'companyId',
  'items',
];

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: Date;

  @IsNumber()
  @IsNotEmpty()
  subTotal: number;

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @IsNumber()
  @IsNotEmpty()
  vat: number;

  @IsNumber()
  @IsNotEmpty()
  vatPercentage: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];

  @IsString()
  @IsOptional()
  pdfUrl?: string;
}
