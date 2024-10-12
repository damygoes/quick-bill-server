import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function validateCustomerUpdateDto(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateCustomerUpdateDto',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const object = args.object as any; // Cast to any to access properties dynamically
          return (
            object.name ||
            object.email ||
            object.mobile ||
            object.phone ||
            object.address
          );
        },
      },
    });
  };
}
