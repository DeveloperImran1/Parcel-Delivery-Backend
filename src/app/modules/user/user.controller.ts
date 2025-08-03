/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';

import { JwtPayload } from 'jsonwebtoken';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { setAuthCookie } from '../../utils/setCookie';
import { createUserTokens } from '../../utils/userTokens';
import { UserServices } from './user.service';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    // token create
    const userToken = createUserTokens(user);

    // password ke extract kore nilam user theke.
    const { password: pass, ...others } = user.toObject();

    // cookie te token set kortesi
    setAuthCookie(res, userToken);

    // sendResponse utils using res send
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User created Successfully',
      data: {
        accessToken: userToken.accessToken,
        refreshToken: userToken.refreshToken,
        user: others,
      },
    });
  },
);

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const user = await UserServices.getMe(decodedToken.userId as string);

    // sendResponse utils using res send
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User retrived Successfully',
      data: user,
    });
  },
);

const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const userId = req.params.id;

    const user = await UserServices.getSingleUser(
      decodedToken,
      userId as string,
    );

    // sendResponse utils using res send
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User retrived Successfully',
      data: user,
    });
  },
);

// get all users
const getAllUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await UserServices.getAllUser(
      req.query as Record<string, string>,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User retrived Successfully',
      data,
    });
  },
);

// getAllSender
const getAllSender = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await UserServices.getAllSender(
      req.query as Record<string, string>,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Sender retrived Successfully',
      data,
    });
  },
);

// getAllReceiver
const getAllReciver = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await UserServices.getAllReciver(
      req.query as Record<string, string>,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Reciver retrived Successfully',
      data,
    });
  },
);

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const userId = req.params.id;

    const verifiedToken: any = req.user;

    const user = await UserServices.updateUser(userId, payload, verifiedToken);

    // sendResponse utils using res send
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User update Successfully',
      data: user,
    });
  },
);

export const UserControllers = {
  createUser,
  getMe,
  updateUser,
  getAllUser,
  getAllSender,
  getAllReciver,
  getSingleUser,
};
