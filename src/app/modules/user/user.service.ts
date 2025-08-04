import bcryptjs from 'bcryptjs';
import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../../config/env';
import AppError from '../../errorHelpers/AppError';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { userSearchableFields } from './user.constant';
import { IAuthProvider, IUser, Role } from './user.interfaces';
import { User } from './user.model';

// Aikhane Partial<IUser> dara bujasse, Iuser interface er type gulote jei property ase, exact all property na thake similar kiso property thakbe.
const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  if (rest.role === Role.ADMIN) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You cannot set Admin role');
  }

  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exist');
  }
  const authProvider: IAuthProvider = {
    provider: 'credentials',
    providerId: email as string,
  };

  const hashPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  const user = await User.create({
    email,
    password: hashPassword,
    auths: authProvider,
    ...rest,
  });

  return user;
};

const getMe = async (userId: string) => {
  const isUserExist = await User.findById(userId).select('-password');

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return isUserExist;
};

const getSingleUser = async (decodedToken: JwtPayload, userId: string) => {
  if (decodedToken.role !== Role.ADMIN) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorized');
  }

  const isUserExist = await User.findById(userId).select('-password');

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return isUserExist;
};

const getAllUser = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);
  const users = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta(),
  ]);
  return {
    meta,
    data,
  };
};

const getAllSender = async (query: Record<string, string>) => {
  query.role = Role.SENDER;

  const queryBuilder = new QueryBuilder(User.find(), query);
  const users = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta(),
  ]);
  return {
    meta,
    data,
  };
};

const getAllReciver = async (query: Record<string, string>) => {
  query.role = Role.RECEIVER;

  const queryBuilder = new QueryBuilder(User.find(), query);
  const users = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta(),
  ]);
  return {
    meta,
    data,
  };
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  verifiedToken: JwtPayload,
) => {
  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not exist');
  }

  if (payload?.isBlocked || payload?.role || payload?.isVerified) {
    // ami admin na hole error diba
    if (verifiedToken.role !== Role.ADMIN) {
      throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorized');
    }

    // akjon admin arekjon admin er info change korte parbena.
    if (
      isUserExist.role === Role.ADMIN &&
      isUserExist._id !== verifiedToken.userId
    ) {
      throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorized');
    }
  }

  // akjon admin arekjon admin er info change korte parbena.
  if (
    isUserExist.role === Role.ADMIN &&
    isUserExist._id !== verifiedToken.userId
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorized');
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  }).select('-password');
  return newUpdatedUser;
};

export const UserServices = {
  createUser,
  getMe,
  updateUser,
  getAllUser,
  getAllSender,
  getAllReciver,
  getSingleUser,
};
