/* eslint-disable @typescript-eslint/no-explicit-any */
import { TGenericErrorResponse, TValidation } from '../interfaces/error.types';

export const handleMongooseValidationError = (
  error: any,
): TGenericErrorResponse => {
  const errorSources: TValidation[] = [];

  const errors = Object.values(error.errors);

  errors.forEach((errObj: any) =>
    errorSources.push({
      path: errObj.path,
      message: errObj.message,
    }),
  );

  return {
    statusCode: 400,
    message: 'Validation Error',
    errorSources,
  };
};
