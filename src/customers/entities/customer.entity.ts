import { AddressDto } from 'src/common/dto/address.dto';
import { Company } from 'src/companies/entities/company.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type CustomerId = string;

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: CustomerId;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'jsonb', nullable: true })
  address: AddressDto;

  @ManyToMany(() => Company, (company) => company.customers)
  companies: Company[];

  @OneToMany(() => Invoice, (invoice) => invoice.customer)
  invoices: Invoice[];
}
