import { Types } from 'mongoose';

export interface IAuthProvider {
  provider: 'google' | 'credentials'; // "google", "credential"
  providerId: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  SENDER = 'SENDER',
  RECEIVER = 'RECEIVER',
}
export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  picture?: string;
  auths?: IAuthProvider[];
  isDeleted?: boolean;
  isBlocked?: boolean;
  isVerified?: boolean;
  role?: Role;
  createdAt?: Date;
  updatedAt?: Date;
}
