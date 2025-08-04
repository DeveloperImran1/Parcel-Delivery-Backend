/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { StatsServices } from './stat.service';

const getUserStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tour = await StatsServices.getUserStats();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User stats retrived successfully',
      data: tour,
    });
  },
);

const getParcelStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tour = await StatsServices.getParcelStats();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Parcel stats retrived successfully',
      data: tour,
    });
  },
);

export const StatsController = {
  getUserStats,
  getParcelStats,
};
