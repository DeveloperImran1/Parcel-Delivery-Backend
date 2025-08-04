// models/parcel.model.ts

import { model, Schema } from 'mongoose';
import { IParcel, IStatusLog } from './parcel.interface';

const StatusLogSchema = new Schema<IStatusLog>(
  {
    status: {
      type: String,
      enum: [
        'Requested',
        'Approved',
        'Dispatched',
        'In Transit',
        'Delivered',
        'Cancelled',
      ],
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
    },
  },
  { _id: true, versionKey: false },
);

const ParcelSchema = new Schema<IParcel>(
  {
    trackingId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    weight: { type: Number, required: true },
    fee: { type: Number, required: true },
    deliveryDate: { type: Date, required: true },
    pickupAddress: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: [
        'Requested',
        'Approved',
        'Dispatched',
        'In Transit',
        'Delivered',
        'Cancelled',
      ],
      default: 'Requested',
    },
    statusLogs: [StatusLogSchema], // embedded subdocuments
    couponCode: { type: String, required: false },
  },
  { timestamps: true, versionKey: false },
);

export const Parcel = model<IParcel>('Parcel', ParcelSchema);
