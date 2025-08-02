import { TGenericErrorResponse } from '../interfaces/error.types';

export const handleCastError = (error: any): TGenericErrorResponse => {
  return {
    statusCode: 400,
    message: 'Invalid MongoDB ObjectID',
  };
};
