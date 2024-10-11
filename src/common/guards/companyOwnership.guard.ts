import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CompaniesService } from 'src/companies/companies.service';
import { Company } from 'src/companies/entities/company.entity';
import { UsersService } from 'src/users/users.service';
import { Error } from '../enums/error.enum';

@Injectable()
export class CompanyOwnershipGuard implements CanActivate {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tokenUser = request.user; // Authenticated user
    const { id } = request.params; // Company ID from route parameters

    if (!id) {
      throw new ForbiddenException(Error.COMPANY_ID_REQUIRED);
    }

    if (!tokenUser || !tokenUser.email) {
      throw new UnauthorizedException(Error.USER_NOT_FOUND);
    }

    const fullUser = await this.usersService.getUserWithEmail(tokenUser.email);

    if (!fullUser) {
      throw new UnauthorizedException(Error.USER_NOT_FOUND);
    }

    // Fetch company details from the database using ID
    const dbCompany: Company = await this.companiesService.getCompany(id);

    if (!dbCompany) {
      throw new ForbiddenException(Error.COMPANY_NOT_FOUND);
    }

    if (dbCompany.belongsTo !== fullUser.id) {
      throw new ForbiddenException(Error.COMPANY_MODIFICATION_FORBIDDEN);
    }

    return true;
  }
}
