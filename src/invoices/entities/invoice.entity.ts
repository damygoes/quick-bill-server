import { Company } from 'src/companies/entities/company.entity';
import { InvoiceItem } from 'src/invoice-items/entities/invoice-item.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceNumber: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  vat: number;

  @Column()
  currency: string;

  @ManyToOne(() => Company, (company) => company.invoices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @OneToMany(() => InvoiceItem, (item) => item.invoice)
  items: InvoiceItem[];
}
