import { model, Schema } from 'mongoose';
import { IAuthProvider, IsActive, IUser, Role } from './user.interfaces';

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { versionKey: false, _id: false },
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    auths: {
      type: [authProviderSchema],
    },
    // bookings and guides er schema akhono create kora hoini. tai tader value set kora jassena. Karon reference kora lagbe.
    // bookings: {},
    // guides: {}
  },
  { versionKey: false, timestamps: true },
);

export const User = model<IUser>('User', userSchema);
