import { Invoice } from 'src/invoices/entities/invoice.entity';
import { Address } from 'src/types/Address';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  website: string;

  @Column()
  phone: string;

  @Column()
  mobile: string;

  @Column()
  email: string;

  @Column()
  image: string;

  @Column()
  industry: string;

  @Column()
  registrationNumber: string;

  @Column('jsonb')
  address: Address;

  @ManyToOne(() => User, (user) => user.companies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  belongsTo: User;

  @OneToMany(() => Invoice, (invoice) => invoice.company)
  invoices: Invoice[];
}
