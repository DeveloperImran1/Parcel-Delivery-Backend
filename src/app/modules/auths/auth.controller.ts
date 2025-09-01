/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errorHelpers/AppError';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { setAuthCookie } from '../../utils/setCookie';
import { createUserTokens } from '../../utils/userTokens';
import { AuthServices } from './auth.service';

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body);

    //  token create
    const userToken = createUserTokens(loginInfo);

    // cookie te token set
    setAuthCookie(res, userToken);

    // isUserExist er moddhe user er all data ase. But password front-end a send na korai better. Tai isUserExist theke password property ke delete korbo.
    const { password: pass, ...rest } = loginInfo.toObject();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User loged in successfull!',
      data: {
        accessToken: userToken.accessToken,
        refreshToken: userToken.refreshToken,
        user: rest,
      },
    });
  },
);

const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // amra jokhon login korbo, tokhon refresh token ta client side er browser er cookie te set kore rakhbe. Akhon new Access token generate korar somoi sei refresh token lagbe. Seita amra req.cookies.refreshToken theke nita parbo.
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'No refresh token recived from cookies',
      );
    }
    const tokenInfo = await AuthServices.getNewAccessToken(
      refreshToken as string,
    );

    // refresh token er moaddhome jokhon new token create korteci, tokhon sei token ta responce hisabe client side a pathassi. But cookie te new access-token ta set kore dita hobe. Tai aikhane res send korar age updated token ta cookie te set kore disi.
    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'New Access Token Retrived Successfully',
      data: tokenInfo,
    });
  },
);

const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Kono user Login ase kina seita ensure hote pari, browser er cookie te accessToken and refreshToken ase kina. Seita check kori. So logout korar jonno accessToken and refreshToken remove korte parle kella fote.
    res.clearCookie('accessToken', {
      httpOnly: true,

      // localhost a aivabe dita hobe
      // secure: false,
      // sameSite: 'lax',

      // code live a jawer pore
      secure: true,
      sameSite: 'none',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,

      // localhost a aivabe dita hobe
      // secure: false,
      // sameSite: 'lax',

      // code live a jawer pore
      secure: true,
      sameSite: 'none',
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Logged Out Successfully',
      data: null,
    });
  },
);

const setPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const { password } = req.body;

    await AuthServices.setPassword(decodedToken.userId, password);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Password set Successfully',
      data: null,
    });
  },
);

const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    await AuthServices.forgotPassword(email);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Email Send Successfully',
      data: null,
    });
  },
);

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;

    await AuthServices.resetPassword(req.body, decodedToken as JwtPayload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Password Reset Successfully',
      data: null,
    });
  },
);

const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // auth.controller a asar age checkAuth middleware a giasilo. Then next() er maddhome ai controller a asce. So checkAuth er moddhe token ke docode kore user er info gulo req.user property er moddhe set kore diase. Tai aikhane distructure kore nissi.
    const decodedToken = req.user;

    const newPassword = req?.body?.newPassword;
    const oldPassword = req?.body?.oldPassword;

    if (!newPassword || !oldPassword) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Old password and new password field is required',
      );
    }

    await AuthServices.changePassword(
      oldPassword,
      newPassword,
      decodedToken as JwtPayload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Password Reset Successfully',
      data: null,
    });
  },
);

export const AuthControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  setPassword,
  forgotPassword,
  resetPassword,
  changePassword,
};
