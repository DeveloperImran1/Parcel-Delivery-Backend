/* eslint-disable @typescript-eslint/no-explicit-any */

import { TGenericErrorResponse, TValidation } from '../interfaces/error.types';

export const handleZodError = (error: any): TGenericErrorResponse => {
  const errorSources: TValidation[] = [];

  error.issues.forEach((errObj: any) =>
    errorSources.push({
      path: errObj.path[errObj.path.length - 1], // Aivabew kora jai. But nicher niom a korle aro well structured hoi.
      // path: errObj.path.reverse().join(" instead "),
      message: errObj.message,
    }),
  );

  return {
    statusCode: 400,
    message: 'Zod Validation Error',
    errorSources,
  };
};
