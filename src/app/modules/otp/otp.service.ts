import crypto from 'crypto';
import { redisClient } from '../../config/redis.config';
import AppError from '../../errorHelpers/AppError';
import { sendEmail } from '../../utils/sendEmail';
import { User } from '../user/user.model';

const OTP_EXPIRATION = 2 * 60; // 120 s

const generateOTP = (length = 6) => {
  // Ai number dewar poart ke dynamic korbo. Because otp er length kom besi hote pare.
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString(); // length 6 hole value er moddhe hobe: 100000 - 999999

  return otp;
};

const sendOTP = async (email: string, name: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(401, 'User Not Found');
  }

  if (user.isVerified) {
    throw new AppError(401, 'User Already verified');
  }

  const otp = generateOTP();
  const redisKey = `otp:${email}`;

  await redisClient.set(redisKey, otp, {
    expiration: {
      type: 'EX',
      value: OTP_EXPIRATION, // expiration time second a dita hobe. Karon type: EX dara second bujhai. type er value milisecond ba minute ew set kora jai.
    },
  });

  // sendEmail er maddhome oi otp ta user ke send kora hosse. Aita amra redis websit a DB te create koresi, oikhane connect a click korle "Launch Redis Insight Web" button a click korle akta page open hobe. Seikhane otp ta store thakbe expiration time 2 minute porjonto. Tarpor delete hoia jabe.
  await sendEmail({
    to: email,
    subject: 'Your OTP Code',
    templateName: 'otp',
    templateData: {
      name,
      otp,
    },
  });
  return {};
};

const verifyOTP = async (email: string, otp: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(401, 'User Not Found');
  }

  if (user.isVerified) {
    throw new AppError(401, 'User Already verified');
  }

  const redisKey = `otp:${email}`;

  // redis DB te find kortesi, ai key dia otp ase kina. Thakle get korbe. Aita localstorage er key value er moto kaj kore.
  const savedOTP = await redisClient.get(redisKey);

  if (!savedOTP) {
    throw new AppError(401, 'Invalid OTP');
  }

  if (savedOTP !== otp) {
    throw new AppError(401, 'Invalid OTP');
  }

  // aikhane update korar kaj and redis theke otp delete korar kaj ta ake oporer sathe dependent. Tai rollback er maddhome korte hoto. Or aivabe Promis.all([er moddhe korleww hobe.])
  await Promise.all([
    User.updateOne(
      { email: email },
      { isVerified: true },
      { runValidators: true },
    ),
    redisClient.del([redisKey]), // otp match kore update er kaj ses hole redis DB theke delete kore dibo. Otherwise 2 minute pore oo delete hobe.
  ]);
};

export const OTPServices = { sendOTP, verifyOTP };
