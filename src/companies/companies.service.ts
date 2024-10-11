import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Paginated } from 'src/common/pagination/pagination.dto';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { checkEmptyRequestBody } from 'src/common/utils/checkEmptyRequestBody';
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

  async getCompany(id: CompanyId): Promise<Company | null> {
    const company = await this.companiesRepository.findOne({
      where: { id: id },
    });
    return company;
  }

  async createCompany(
    createCompanyDto: CreateCompanyDto,
    userId: UserId,
  ): Promise<CompanyId | null> {
    // Create a new company instance
    const newCompany = await this.companiesRepository.create({
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
    const existingCompany = await this.getCompany(id);

    if (!existingCompany) {
      return null;
    }

    await this.companiesRepository.delete(id);

    throw new HttpException(
      'Company deleted successfully',
      HttpStatus.NO_CONTENT,
    );
  }
}
