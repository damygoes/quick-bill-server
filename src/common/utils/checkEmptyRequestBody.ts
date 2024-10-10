import { BadRequestException } from '@nestjs/common';

export function checkEmptyRequestBody(
  dto: object,
  message: string = 'No properties provided for update.',
): void {
  if (Object.keys(dto).length === 0) {
    throw new BadRequestException(message);
  }
}
