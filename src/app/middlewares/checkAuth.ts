import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../config/env';
import AppError from '../errorHelpers/AppError';
import { User } from '../modules/user/user.model';
import { verifyToken } from '../utils/jwt';

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization || req.cookies.accessToken;

      if (!accessToken) {
        throw new AppError(401, 'Token not found');
      }

      // verifiedToken er moddhe user info er plain object thakbe. Jeita amra token set korar somoi payload hisabe diasi.
      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET,
      ) as JwtPayload;

      // DB te oi email er user ase kina, check kortesi.
      const isUserExist = await User.findOne({
        email: verifiedToken.email,
      });

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
      }

      // user verified, block or inactive hole or deleted hole error throw korbo.
      if (!isUserExist.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User is not verified');
      }

      if (isUserExist.isBlocked) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserExist.isBlocked}`,
        );
      }

      if (isUserExist.isDeleted === true) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User is Deleted');
      }
      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(403, 'You are not permited to view this route!!');
      }

      req.user = verifiedToken;

      next();
    } catch (error) {
      next(error);
    }
  };
