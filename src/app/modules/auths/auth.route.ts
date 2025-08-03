import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../user/user.interfaces';
import { AuthControllers } from './auth.controller';

const router = Router();

router.post('/login', AuthControllers.credentialsLogin);
router.post('/refresh-token', AuthControllers.getNewAccessToken);
router.post('/logout', AuthControllers.logout);

// google dia login korar por, new password set korte chai. jar fole next time theke password diaw login korte parbe.
router.post(
  '/set-password',
  checkAuth(...Object.values(Role)),
  AuthControllers.setPassword,
);

// kono user password vule gele, valid email dia password forget korar jonno "/fotgot-password" route a hit korle, token dia email send korbo tar email a. Then se oi token and new password ta dia "/reset-password" route a post korbe.
router.post('/forgot-password', AuthControllers.forgotPassword);

router.post(
  '/reset-password',
  checkAuth(...Object.values(Role)),
  // Aitar jonno zod validation korte hobe.
  AuthControllers.resetPassword,
);

// previours password ke change kore new password set korbo.
router.post(
  '/change-password',
  checkAuth(...Object.values(Role)),
  AuthControllers.changePassword,
);
export const AuthRoutes = router;
