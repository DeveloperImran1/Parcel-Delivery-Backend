/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';

import { JwtPayload } from 'jsonwebtoken';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { IParcel } from './parcel.interface';
import { ParcelService } from './parcel.service';

const createParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcel = await ParcelService.createParcel(req.body, req.user);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Parcel created Successfully',
      data: parcel,
    });
  },
);

const getAllParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcel = await ParcelService.getAllParcel(
      req.query as Record<string, string>,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Parcel retried Successfully',
      data: parcel,
    });
  },
);

const getSingleParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id;
    const decodedToken = req.user;
    const parcel = await ParcelService.getSingleParcel(parcelId, decodedToken);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Parcel retried Successfully',
      data: parcel,
    });
  },
);

const getMyParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;

    const parcel = await ParcelService.getMyParcel(
      req.query as Record<string, string>,
      decodedToken as JwtPayload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Parcel retried Successfully',
      data: parcel,
    });
  },
);

const updateParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;
    const trackingId = req.params.id;
    const payload = req.body;

    const parcel = await ParcelService.updateParcel(
      trackingId,
      payload as Partial<IParcel>,
      decodedToken as JwtPayload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Parcel updated Successfully',
      data: parcel,
    });
  },
);

export const ParcelController = {
  createParcel,
  getAllParcel,
  getSingleParcel,
  getMyParcel,
  updateParcel,
};
