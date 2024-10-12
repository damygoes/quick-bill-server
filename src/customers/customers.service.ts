import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Error } from 'src/common/enums/error.enum';
import { Paginated } from 'src/common/pagination/pagination.dto';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { checkEmptyRequestBody } from 'src/common/utils/checkEmptyRequestBody';
import { CompaniesService } from 'src/companies/companies.service';
import { Company, CompanyId } from 'src/companies/entities/company.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, CustomerId } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @Inject(forwardRef(() => CompaniesService))
    private readonly companiesService: CompaniesService,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    private readonly paginationService: PaginationService,
  ) {}

  async getCustomers(
    companyId: CompanyId,
    page: number,
    limit: number,
  ): Promise<Paginated<Customer> | null> {
    const dbCompany = await this.companiesService.getCompany(companyId);

    if (!dbCompany) {
      return null;
    }

    // Create query builder to filter customers based on companyId
    const query = this.customersRepository
      .createQueryBuilder('customer')
      .leftJoin('customer.companies', 'company')
      .where('company.id = :companyId', { companyId });

    return this.paginationService.paginate(query, page, limit);
  }

  async getCustomer(
    customerId: CustomerId,
    companyId: CompanyId,
  ): Promise<Customer | null> {
    const customer = await this.customersRepository.findOne({
      where: { id: customerId },
      relations: ['companies'], // Load the companies relation
    });

    if (!customer) {
      return null;
    }

    // Check if the customer belongs to the requested company
    const belongsToCompany = customer.companies.some(
      (company) => company.id === companyId,
    );

    if (!belongsToCompany) {
      return null;
    }

    // Map over the companies array to extract only the ids
    const companyIds = customer.companies.map((company) => company.id);

    // Remove the full companies data and replace with just company ids
    (customer as any).companyIds = companyIds;
    delete (customer as any).companies;

    return customer;
  }

  async createCustomer(
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerId | null> {
    checkEmptyRequestBody(createCustomerDto);

    const companyToCreateCustomerFor: CompanyId = createCustomerDto.customerOf;

    if (!companyToCreateCustomerFor) {
      throw new HttpException(
        Error.COMPANY_ID_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const company = await this.companiesRepository.findOne({
      where: { id: companyToCreateCustomerFor },
    });

    if (!company) {
      throw new HttpException(Error.COMPANY_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const customerAlreadyExistsForCompany =
      await this.customersRepository.findOne({
        where: {
          name: createCustomerDto.name,
          email: createCustomerDto.email,
        },
        relations: ['companies'], // Load the companies relation
      });

    const customerBelongsToCompany =
      customerAlreadyExistsForCompany?.companies.some(
        (company) => company.id === companyToCreateCustomerFor,
      );

    if (customerBelongsToCompany) {
      throw new HttpException(
        Error.CUSTOMER_ALREADY_EXISTS_FOR_COMPANY,
        HttpStatus.CONFLICT,
      );
    }

    // Create new customer if no conflict exists
    const newCustomer = this.customersRepository.create(createCustomerDto);

    // Associate the customer with the company
    newCustomer.companies = [company];

    try {
      const savedCustomer = await this.customersRepository.save(newCustomer);
      return savedCustomer.id;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // Handle specific database errors, e.g., unique constraint violation
        throw new HttpException(
          Error.CUSTOMER_ALREADY_EXISTS_FOR_COMPANY,
          HttpStatus.CONFLICT,
        );
      }
      // For other unexpected errors, rethrow them
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateCustomer(
    customerId: CustomerId,
    companyId: CompanyId,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerId | null> {
    checkEmptyRequestBody(updateCustomerDto);

    const existingCustomer = await this.getCustomer(customerId, companyId);

    if (!existingCustomer) {
      throw new HttpException(Error.CUSTOMER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Proceed with updating the customer with the new data
    const updatedCustomer = await this.customersRepository.save({
      ...existingCustomer,
      ...updateCustomerDto,
    });

    return updatedCustomer.id;
  }

  async removeCustomerFromCompany(
    customerId: CustomerId,
    companyId: CompanyId,
  ): Promise<string> {
    // Check if the customer belongs to the company
    const customer = await this.getCustomer(customerId, companyId);

    if (!customer) {
      throw new HttpException(
        'Customer not found for this company',
        HttpStatus.NOT_FOUND,
      );
    }

    // Fetch the company along with its customers
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
      relations: ['customers'],
    });

    if (!company) {
      throw new HttpException(Error.COMPANY_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Remove the customer from the company's customers array
    company.customers = company.customers.filter(
      (customer) => customer.id !== customerId,
    );

    // Save the updated company
    await this.companiesRepository.save(company);

    return 'Customer removed from company successfully';
  }
}
