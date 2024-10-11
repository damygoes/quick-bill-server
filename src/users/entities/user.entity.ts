import { Company } from 'src/companies/entities/company.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export type UserId = string;

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: UserId;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ type: 'boolean', default: false })
  isOnboarded: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // The @OneToMany side does not need a @JoinColumn
  @OneToMany(() => Company, (company) => company.user)
  companies: Company[];
}
