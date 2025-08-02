/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';

import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { UserServices } from './user.service';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const user = await UserServices.createUser(req.body);

    // sendResponse utils using res send
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User created Successfully',
      data: user,
    });
  },
);

export const UserControllers = {
  createUser,
};
