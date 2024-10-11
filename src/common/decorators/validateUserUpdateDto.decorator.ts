import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function validateUserUpdateDto(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateUserUpdateDto',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const object = args.object as any; // Cast to any to access properties dynamically
          return (
            object.firstName ||
            object.lastName ||
            object.email ||
            object.profilePicture
          );
        },
      },
    });
  };
}
