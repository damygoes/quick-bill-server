import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CompaniesService } from 'src/companies/companies.service';
import { UsersService } from 'src/users/users.service';
import { Error } from '../enums/error.enum';

@Injectable()
export class CustomerOwnershipGuard implements CanActivate {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tokenUser = request.user;

    const { customerId, companyId } = request.params;

    if (!tokenUser || !tokenUser.email) {
      throw new UnauthorizedException(Error.USER_NOT_FOUND);
    }

    if (!companyId) {
      throw new ForbiddenException(Error.COMPANY_ID_REQUIRED);
    }

    const fullUser = await this.usersService.getUserWithEmail(tokenUser.email);

    if (!fullUser) {
      throw new UnauthorizedException(Error.USER_NOT_FOUND);
    }

    const dbCompany = await this.companiesService.getCompany(companyId, [
      'customers',
    ]);

    if (!dbCompany) {
      throw new ForbiddenException(Error.COMPANY_NOT_FOUND);
    }

    if (dbCompany.belongsTo !== fullUser.id) {
      throw new ForbiddenException(Error.COMPANY_MODIFICATION_FORBIDDEN);
    }

    if (customerId) {
      const customerExists =
        await this.companiesService.doesCustomerBelongToCompany(
          customerId,
          companyId,
        );

      if (!customerExists) {
        throw new ForbiddenException(Error.CUSTOMER_NOT_FOUND);
      }
    }

    // If all checks pass, allow the request
    return true;
  }
}
