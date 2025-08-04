import { Types } from 'mongoose';

export interface IStatusLog {
  _id?: Types.ObjectId;
  status:
    | 'Requested'
    | 'Approved'
    | 'Dispatched'
    | 'In Transit'
    | 'Delivered'
    | 'Cancelled';
  timestamp?: Date;
  updatedBy: Types.ObjectId; // admin ID
  note?: string;
}

export interface IParcel {
  _id?: Types.ObjectId;
  trackingId: string;
  type: 'Document' | 'Product' | string;
  weight: number;
  fee: number;
  deliveryDate?: Date;
  pickupAddress: string;
  deliveryAddress: string;
  sender: Types.ObjectId; // User with role: sender
  receiver: Types.ObjectId; // User with role: receiver
  status:
    | 'Requested'
    | 'Approved'
    | 'Dispatched'
    | 'In Transit'
    | 'Delivered'
    | 'Cancelled';
  statusLogs: IStatusLog[]; // Embedded status history

  couponCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
