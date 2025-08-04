/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-dynamic-delete */
import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errorHelpers/AppError';
import { getTrackingId } from '../../utils/getTrackingId';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { Role } from '../user/user.interfaces';
import { User } from '../user/user.model';
import { parcelSearchableFields } from './parcel.constant';
import { IParcel, IStatusLog } from './parcel.interface';
import { Parcel } from './parcel.model';

type ParcelStatus =
  | 'Requested'
  | 'Approved'
  | 'Dispatched'
  | 'In Transit'
  | 'Delivered'
  | 'Cancelled';

const createParcel = async (
  payload: Partial<IParcel>,
  decodedToken: JwtPayload,
) => {
  if (decodedToken.userId !== payload.sender) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You Unauthorized');
  }
  const isSenderExist = await User.findById(payload.sender);
  if (!isSenderExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sender Not Found');
  }
  if (isSenderExist.role !== Role.SENDER) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Sender role is dont match');
  }

  const isReceiverExist = await User.findById(payload.receiver);
  if (!isReceiverExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Receiver Not Found');
  }
  if (isReceiverExist.role !== Role.RECEIVER) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Receiver role is dont match');
  }

  if (payload.couponCode) {
    if (payload.couponCode !== 'NEW50') {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'This Coupon code not available',
      );
    }
  }

  // deliveryDate set korbo
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 2); // আজকের সাথে ২ দিন যোগ করো
  payload.deliveryDate = currentDate;

  // status set
  payload.status = 'Requested';

  // trackingId set
  payload.trackingId = getTrackingId();

  // fee set in parcel obj
  if ((payload?.weight as number) < 3) {
    payload.fee = 150;
  } else {
    payload.fee = 200;
  }

  // status log set
  const statusLogs: [IStatusLog] = [
    {
      status: 'Requested',
      updatedBy: payload.sender!,
      note: 'Sender create a new Parcel',
    },
  ];
  payload.statusLogs = statusLogs;

  const parcel = await Parcel.create(payload);
  return parcel;
};

const getAllParcel = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Parcel.find(), query);
  const parcels = await queryBuilder
    .search(parcelSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    parcels.build(),
    queryBuilder.getMeta(),
  ]);
  return {
    meta,
    data,
  };
};

const getSingleParcel = async (
  trackingId: string,
  decodedToken: JwtPayload,
) => {
  const parcel = await Parcel.findOne({ trackingId: trackingId });

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
  }

  if (decodedToken.role === Role.SENDER) {
    if (parcel?.sender.toString() !== decodedToken.userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are Unauthorized');
    }
  }

  if (decodedToken.role === Role.RECEIVER) {
    if (parcel?.receiver.toString() !== decodedToken.userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are Unauthorized');
    }
  }

  return parcel;
};

const getMyParcel = async (
  query: Record<string, string>,
  decodedToken: JwtPayload,
) => {
  if (decodedToken.role === Role.SENDER) {
    query.sender = decodedToken.userId;
  } else if (decodedToken.role === Role.RECEIVER) {
    query.receiver = decodedToken.userId;
  }
  const queryBuilder = new QueryBuilder(Parcel.find(), query);
  const parcels = await queryBuilder
    .search(parcelSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    parcels.build(),
    queryBuilder.getMeta(),
  ]);
  return {
    meta,
    data,
  };
};

const updateParcel = async (
  trackingId: string,
  payload: Partial<IParcel>,
  decodedToken: JwtPayload,
) => {
  const isExistParcel = await Parcel.findOne({ trackingId });
  if (!isExistParcel) {
    throw new AppError(httpStatus.NOT_FOUND, 'Parcel not found');
  }

  // is sender
  if (decodedToken.role === Role.SENDER) {
    // onno karo parcel update korte parbena
    if (decodedToken.userId !== isExistParcel.sender.toString()) {
      throw new AppError(httpStatus.FORBIDDEN, `You are not authorised`);
    }

    // parcel er status jodi Dispatched already hooia jai. tahole edit korte parbena
    if (
      isExistParcel.status !== 'Requested' &&
      isExistParcel.status !== 'Approved'
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'This parcel already dispatched',
      );
    }

    // sender sudho status ke cancled korte parbe, onno kiso korte parbena.
    if (payload.status !== 'Cancelled') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `You cannont set ${payload.status}`,
      );
    }

    // Remove unauthorized fields for sender
    const disallowedFields = ['fee', 'sender', 'deliveryDate'];
    disallowedFields.forEach((field) => delete payload[field as keyof IParcel]);
  }

  // is receiver
  if (decodedToken.role === Role.RECEIVER) {
    // onno karo parcel update korte parbena
    if (decodedToken.userId !== isExistParcel.receiver.toString()) {
      throw new AppError(httpStatus.FORBIDDEN, `You are not authorised`);
    }

    // parcel er status jodi Dispatched aljready hooia jai. tahole edit korte parbena

    if (isExistParcel.status !== 'In Transit') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You cannot update status, if current status not will be InTransit.',
      );
    }

    // reciver sudho status ke Delivered korte parbe, onno kiso korte parbena.
    if (payload.status !== 'Delivered') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `You cannont set ${payload.status}`,
      );
    }

    // Remove unauthorized fields for sender
    const disallowedFields = [
      'fee',
      'sender',
      'deliveryDate',
      'couponCode',
      'receiver',
      'sender',
      'pickupAddress',
      'deliveryDate',
      'fee',
      'weight',
      'type',
    ];
    disallowedFields.forEach((field) => delete payload[field as keyof IParcel]);
  }

  // ---- admin can do all

  if (payload.couponCode) {
    if (payload.couponCode !== 'NEW50') {
      throw new AppError(httpStatus.BAD_REQUEST, 'This coupon code not exist!');
    }
  }

  if (payload.status) {
    // status logs --> akta status theke previous status a jate parbena.
    const validStatuFlow: Record<ParcelStatus, ParcelStatus[]> = {
      Requested: ['Approved', 'Cancelled'],
      Approved: ['Dispatched', 'Cancelled'],
      Dispatched: ['In Transit', 'Cancelled'],
      'In Transit': [],
      Delivered: [],
      Cancelled: [],
    };

    const currentStatus = isExistParcel.status as ParcelStatus;
    const allowedNextStatus = validStatuFlow[currentStatus];
    if (!allowedNextStatus.includes(payload.status as ParcelStatus)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Invalid status transition: ${currentStatus} ➝ ${payload.status}`,
      );
    }

    const newLog: IStatusLog = {
      status: payload.status,
      updatedBy: decodedToken.userId,
      note: (payload as any).note || '', // fallback to empty string if not provided
    };
    payload.statusLogs = [...(isExistParcel.statusLogs as []), newLog];
  }
  const updatedParcel = await Parcel.findOneAndUpdate({ trackingId }, payload, {
    new: true,
    runValidators: true,
  });

  return updatedParcel;
};

export const ParcelService = {
  createParcel,
  getAllParcel,
  getSingleParcel,
  getMyParcel,
  updateParcel,
};
