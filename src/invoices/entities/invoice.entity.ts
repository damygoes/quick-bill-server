import { Company } from 'src/companies/entities/company.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { InvoiceItem } from 'src/invoice-items/entities/invoice-item.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type InvoiceId = string;

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: InvoiceId;

  @Column({ unique: true })
  invoiceNumber: string;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  vat: number;

  @Column({ type: 'integer' })
  vatPercentage: number;

  @Column()
  currency: string;

  @Column({ default: false })
  isArchived: boolean;

  @Column({ default: false })
  markAsDraft: boolean;

  @Column({ nullable: true })
  pdfUrl: string;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @ManyToOne(() => Company, (company) => company.invoices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ManyToOne(() => Customer, (customer) => customer.invoices, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
