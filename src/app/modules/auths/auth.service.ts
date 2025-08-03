/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcryptjs from 'bcryptjs';
import httpStatus from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { envVars } from '../../config/env';
import AppError from '../../errorHelpers/AppError';
import { sendEmail } from '../../utils/sendEmail';
import { createNewAccessTokenWithRefreshToken } from '../../utils/userTokens';
import { IAuthProvider, IUser } from '../user/user.interfaces';
import { User } from '../user/user.model';

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = await User.findOne({ email });
  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const isPasswordMatched = await bcryptjs.compare(
    password as string,
    isUserExist.password as string,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_GATEWAY, 'Invalid Password');
  }

  return isUserExist;
};

// new token generate using refresh token
const getNewAccessToken = async (refreshToken: string) => {
  // refresh token dia new akta token create korar kaj ta utils > userTokens.ts file er moddhe akta function a koreci.
  const accessToken = await createNewAccessTokenWithRefreshToken(refreshToken);
  return {
    accessToken,
  };
};

const setPassword = async (userId: string, plainPassword: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // jodi google dia login kore thake, and password already set kore thake. Tahole ai api error throw korbe. Karon aita password reset korar jonno noi. Sudho jei user ra google dia login korese. Tara credential login system available korte chai. Tader jonno 1st time akbar password set korar system aita.
  if (
    user.password &&
    user.auths.some((authObject) => authObject.provider == 'google')
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already set your password. Now you can change your password from your profile password update page.',
    );
  }

  // aikhane user.auth.some()  -> method dara mean kore, er moddhe jei function ase. Sei function er kono conditaion match korlei output true return korbe.
  if (user.auths.some((authObject) => authObject.provider == 'credentials')) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You are loged in with credential. So you can reset your password. You cannot set password.',
    );
  }

  const hashedPassword = await bcryptjs.hash(
    plainPassword,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  user.password = hashedPassword;

  const credentialProvider: IAuthProvider = {
    provider: 'credentials',
    providerId: user.email,
  };
  const auths: IAuthProvider[] = [...user.auths, credentialProvider];

  user.auths = auths;

  await user.save();
};

const forgotPassword = async (email: string) => {
  const isUserExist = await User.findOne({ email: email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  // user verified, block or inactive hole or deleted hole error throw korbo.
  if (!isUserExist.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User is not verified');
  }

  if (isUserExist.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, `User is blocked`);
  }

  if (isUserExist.isDeleted === true) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User is Deleted');
  }

  const JwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  // createUserTokens.ts name a akta utility function ase amader. Jeita use kore jwtToken create korte partam. But ai resetToken er expired time maximum 10 minute hobe. Tai extravabe create kortesi.
  const resetToken = await jwt.sign(JwtPayload, envVars.JWT_ACCESS_SECRET, {
    expiresIn: '10m',
  });

  const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;

  sendEmail({
    to: isUserExist.email,
    subject: 'Password Reset',
    templateName: 'forgetPassword',
    templateData: {
      // forgetpassword.ejs file a dynamic vabe jei jei variable gul use koreci.Sei variable gulo aikhane templateDatar moddhe pathate hobe.
      name: isUserExist.name,
      resetUILink,
    },
  });

  // Email a send howa link: http://localhost:5173/reset-password?id=688688ef5fd418af113f0d99&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODg2ODhlZjVmZDQxOGFmMTEzZjBkOTkiLCJlbWFpbCI6ImRldmVsb3BlcmltcmFuMTEyMkBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc1MzY0NzM2OSwiZXhwIjoxNzUzNjQ3OTY5fQ.hN14hX1yJUXmWzdG44wv3NVzDT0jY3vpUE-3Tgbvdz4

  // Aikhan theke id er value and token er value dia newPassword set korar jonno reset-password route a hit korbo.
};

const resetPassword = async (
  payload: Record<string, any>,
  decodedToken: JwtPayload,
) => {
  if (payload.id != decodedToken.userId) {
    throw new AppError(401, 'You can not reset your password');
  }

  const isUserExist = await User.findById(decodedToken.userId);
  if (!isUserExist) {
    throw new AppError(401, 'User does not exist');
  }

  const hashedPassword = await bcryptjs.hash(
    payload.newPassword,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  isUserExist.password = hashedPassword;

  await isUserExist.save();
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload,
) => {
  const user = await User.findById(decodedToken.userId);
  console.log(oldPassword, newPassword, decodedToken);
  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user?.password as string,
  );

  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.FORBIDDEN, 'Your old password not matched!');
  }

  // aikhane user null hobena, aita bujhar jonno not null assertion symbol (!) use koreci. ar hash kora password ke user.password er moddhe bose, save() kore diasi.
  user!.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  user!.save();
};
export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
  setPassword,
  forgotPassword,
  resetPassword,
  changePassword,
};
