export enum Error {
  USER_NOT_FOUND = 'User not found',
  USER_ALREADY_EXISTS = 'User already exists',
  INVALID_CREDENTIALS = 'Invalid credentials',
  USER_MODIFICATION_FORBIDDEN = "You don't have permission to modify this user",
  COMPANY_MODIFICATION_FORBIDDEN = "You don't have permission to modify this company",
  COMPANY_NOT_FOUND = 'Company not found',
  COMPANY_ACCESS_FORBIDDEN = "You don't have permission to access this company",
  COMPANIES_NOT_FOUND = 'Companies not found',
  COMPANY_ID_REQUIRED = 'Company ID is required',
}
