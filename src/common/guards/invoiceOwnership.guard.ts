import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CompaniesService } from 'src/companies/companies.service';
import { Company } from 'src/companies/entities/company.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { InvoicesService } from 'src/invoices/invoices.service';
import { UsersService } from 'src/users/users.service';
import { Error } from '../enums/error.enum';

@Injectable()
export class InvoiceOwnershipGuard implements CanActivate {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly usersService: UsersService,
    private readonly invoicesService: InvoicesService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tokenUser = request.user; // Authenticated user
    const { invoiceId, companyId } = request.params;

    if (!companyId) {
      throw new ForbiddenException(Error.COMPANY_ID_REQUIRED);
    }

    if (!invoiceId) {
      throw new ForbiddenException(Error.INVOICE_ID_REQUIRED);
    }

    if (!tokenUser || !tokenUser.email) {
      throw new UnauthorizedException(Error.USER_NOT_FOUND);
    }

    const fullUser = await this.usersService.getUserWithEmail(tokenUser.email);

    if (!fullUser) {
      throw new UnauthorizedException(Error.USER_NOT_FOUND);
    }

    // Fetch company details from the database using ID
    const dbCompany: Company =
      await this.companiesService.getCompany(companyId);

    if (!dbCompany) {
      throw new ForbiddenException(Error.COMPANY_NOT_FOUND);
    }

    // Fetch Invoice details from the database using ID
    const dbInvoice: Invoice = await this.invoicesService.getInvoice(invoiceId);

    if (!dbInvoice) {
      throw new ForbiddenException(Error.INVOICE_NOT_FOUND);
    }

    if (dbCompany.belongsTo !== fullUser.id) {
      throw new ForbiddenException(Error.COMPANY_MODIFICATION_FORBIDDEN);
    }

    if (dbInvoice.company.id !== companyId) {
      throw new ForbiddenException(Error.INVOICE_MODIFICATION_FORBIDDEN);
    }

    return true;
  }
}
