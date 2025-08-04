/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { deleteImageFromCloudinary } from '../config/cloudinrary.config';
import { envVars } from '../config/env';
import AppError from '../errorHelpers/AppError';
import { handleCastError } from '../helpers/handleCastError';
import { handleDuplicateKeyError } from '../helpers/handleDuplicateError';
import { handleMongooseValidationError } from '../helpers/handleValidationError';
import { handleZodError } from '../helpers/handleZodError';
import { TValidation } from '../interfaces/error.types';

export const globalErrorHandler = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // single image upload er por data create or update a kono error hole .
  if (req.file) {
    await deleteImageFromCloudinary(req.file.path);
  }

  // multiple image delete korar jonno
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const imagesUrl = req.files.map((file) => file.path);

    await Promise.all(imagesUrl.map((url) => deleteImageFromCloudinary(url)));
  }

  let statusCode = 500;
  let message = `Something went wrong`;
  let errorSources: TValidation[] = [
    // {
    //   path: "isVerified",
    //   message: "Cast to Boolean failed for value ..."
    // }
  ];

  // amader project development a thaklei sudho ai console.log hose. Because production a ai console user dekhle issue hobe.
  if (envVars.NODE_ENV === 'development') {
    console.log('Gobal error is ', error);
  }

  // Mongoose Duplicate key error
  if (error.code === 11000) {
    const simplifiedError = handleDuplicateKeyError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  }

  // Mongoose Invalid MongoDB Object ID
  else if (error.name === 'CastError') {
    const simplifiedError = handleCastError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  }
  // Mongoose Validation error
  else if (error.name === 'ValidationError') {
    const simplifiedError = handleMongooseValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources as TValidation[];
  }
  // Zod Validation error
  else if (error.name === 'ZodError') {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources as TValidation[];
  }
  // Jokhon throw new AppError() ke call kori, tokhon ai block a jai.
  else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Jokhon throw new Error() ke call kori, tokhon ai block a jai.
  else if (error instanceof Error) {
    statusCode = 500;
    message = error.message;
  }

  res.status(statusCode).json({
    succuss: false,
    message,
    errorSources,
    error: envVars.NODE_ENV === 'development' ? error : null,
    stack: envVars.NODE_ENV === 'development' ? error.stack : null, // production a gele stack a null dekhabe. Tokhon error er details show hobena.
  });
};
