import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function validateCompanyUpdateDto(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateCompanyUpdateDto',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const object = args.object as any; // Cast to any to access properties dynamically
          return (
            object.name ||
            object.website ||
            object.phone ||
            object.mobile ||
            object.email ||
            object.image ||
            object.industry ||
            object.registrationNumber ||
            object.address
          );
        },
      },
    });
  };
}
