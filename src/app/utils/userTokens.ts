import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../config/env';
import AppError from '../errorHelpers/AppError';
import { IUser } from '../modules/user/user.interfaces';
import { User } from '../modules/user/user.model';
import { generateToken, verifyToken } from './jwt';

export const createUserTokens = (user: Partial<IUser>) => {
  // Token create
  const jwtPayload = {
    email: user.email,
    role: user.role,
    userId: user._id,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES,
  );

  // Refresh token same way te create korbo, sudho secret and expires time ta change hobe.
  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES,
  );

  return { accessToken, refreshToken };
};

export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string,
) => {
  // jei refreshToken dia new accessToken generate korbo, sei refreshToken valid kina ta verify korbo and decode kore user er data gulo nia asbo. Sei user er info gulo verifiedRefreshToken er moddhe store thakbe.
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET,
  ) as JwtPayload;

  // DB te oi email er user ase kina, check kortesi.
  const isUserExist = await User.findOne({ email: verifiedRefreshToken.email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  // user block or inactive hole or deleted hole error throw korbo.
  if (isUserExist.isBlocked) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User is ${isUserExist.isBlocked}`,
    );
  }

  if (isUserExist.isDeleted === true) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User is Deleted');
  }

  // accessToke token create kore return kore dissi. Akhon controller er moddhe ai new accessToken ta cookie te reset kore diba and front-end a send korbe.
  const jwtPayload = {
    email: verifiedRefreshToken.email,
    role: verifiedRefreshToken.role,
    userId: verifiedRefreshToken._id,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES,
  );

  return accessToken;
};
