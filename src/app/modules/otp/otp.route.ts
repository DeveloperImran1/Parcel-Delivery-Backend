import { Router } from 'express';
import { OTPController } from './otp.controller';

const route = Router();

// User website a register korar pore verified false thake. Seitake true korar jonno user jokhon /send route a request korbe, tokhon akta otp create kore redis DB te store korbo and user er email a otp code send korbo.
route.post('/send', OTPController.sendOTP);

// User otp ta email a recive korbe, tarpor verify korar jonno sei otp abaar /verify route a hit korbe. Then amra backend theke otp ke cause kore redis theke ager otp nia check korbo. Match hole user er verified status true kore dibo.
route.post('/verify', OTPController.verifyOTP);

export const OtpRoutes = route;
