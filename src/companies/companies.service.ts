import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Error } from 'src/common/enums/error.enum';
import { Paginated } from 'src/common/pagination/pagination.dto';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { checkEmptyRequestBody } from 'src/common/utils/checkEmptyRequestBody';
import { Customer, CustomerId } from 'src/customers/entities/customer.entity';
import { UserId } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company, CompanyId } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private readonly paginationService: PaginationService,
  ) {}

  async getCompanies(
    userId: CompanyId,
    page: number,
    limit: number,
  ): Promise<Paginated<Company> | null> {
    return this.paginationService.paginate(
      this.companiesRepository,
      page,
      limit,
      { belongsTo: userId },
    );
  }

  async getCompany(
    id: CompanyId,
    relations: string[] = [],
  ): Promise<Company | null> {
    const company = await this.companiesRepository.findOne({
      where: { id: id },
      relations, // Include relations if provided
    });
    return company;
  }

  async createCompany(
    createCompanyDto: CreateCompanyDto,
    userId: UserId,
  ): Promise<CompanyId | null> {
    // Check if a company with the same name already exists for the user
    const existingCompany = await this.companiesRepository.findOne({
      where: {
        name: createCompanyDto.name,
        belongsTo: userId,
      },
    });

    if (existingCompany) {
      throw new ConflictException(Error.COMPANY_ALREADY_EXISTS);
    }

    // If no duplicate is found, proceed with company creation
    const newCompany = this.companiesRepository.create({
      ...createCompanyDto,
      belongsTo: userId,
    });

    // Save the new company
    const savedCompany = await this.companiesRepository.save(newCompany);

    return savedCompany.id;
  }

  async updateCompany(
    id: CompanyId,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyId | null> {
    checkEmptyRequestBody(updateCompanyDto);

    const existingCompany = await this.getCompany(id);

    if (!existingCompany) {
      return null;
    }

    const updatedCompany = await this.companiesRepository.save({
      ...existingCompany,
      ...updateCompanyDto,
    });

    return updatedCompany.id;
  }

  async deleteCompany(id: CompanyId) {
    const existingCompany = await this.companiesRepository.findOne({
      where: { id },
      relations: ['customers'], // Load related customers
    });

    if (!existingCompany) {
      throw new HttpException(Error.COMPANY_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Delete all associated customers
    if (existingCompany.customers.length > 0) {
      await this.customersRepository.delete(
        existingCompany.customers.map((customer) => customer.id),
      );
    }

    // Now delete the company
    await this.companiesRepository.delete(id);

    throw new HttpException(
      'Company deleted successfully',
      HttpStatus.NO_CONTENT,
    );
  }

  async doesCustomerBelongToCompany(
    customerId: CustomerId,
    companyId: CompanyId,
  ): Promise<boolean> {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
      relations: ['customers'],
    });

    return (
      company?.customers.some((customer) => customer.id === customerId) || false
    );
  }
}
