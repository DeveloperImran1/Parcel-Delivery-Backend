/* eslint-disable @typescript-eslint/no-explicit-any */
import { TGenericErrorResponse } from '../interfaces/error.types';

export const handleDuplicateKeyError = (error: any): TGenericErrorResponse => {
  const matchedArr = error.message.match(/"([^"]*)"/);

  return {
    statusCode: 400,
    message: `${matchedArr[1]} already exist`,
  };
};
