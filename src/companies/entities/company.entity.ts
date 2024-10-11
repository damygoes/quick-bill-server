import { Address } from 'src/common/types/Address';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { User, UserId } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type CompanyId = string;

@Entity()
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: CompanyId;

  @Column()
  name: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  mobile: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: 'none' })
  industry: string;

  @Column({ nullable: true })
  registrationNumber: string;

  @Column('jsonb')
  address: Address;

  @Column({ name: 'userId' })
  belongsTo: UserId;

  @ManyToOne(() => User, (user) => user.companies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // Correctly placed here
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => Invoice, (invoice) => invoice.company)
  invoices: Invoice[];
}
