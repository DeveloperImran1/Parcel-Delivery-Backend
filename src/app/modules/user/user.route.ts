import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { validateRequest } from '../../middlewares/validationRequest';
import { UserControllers } from './user.controller';
import { Role } from './user.interfaces';
import { createUserZodSchema, updateUserZodSchema } from './user.validation';
const router = Router();

router.post(
  '/register',
  validateRequest(createUserZodSchema),
  UserControllers.createUser,
);

router.get('/me', checkAuth(...Object.values(Role)), UserControllers.getMe);

router.get('/all-users', checkAuth(Role.ADMIN), UserControllers.getAllUser);

router.get(
  '/all-sender',
  checkAuth(...Object.values(Role)),
  UserControllers.getAllSender,
);

router.get(
  '/all-receiver',
  checkAuth(...Object.values(Role)),
  UserControllers.getAllReciver,
);

router.get('/:id', checkAuth(Role.ADMIN), UserControllers.getSingleUser);

router.patch(
  '/:id',
  checkAuth(...Object.values(Role)),
  validateRequest(updateUserZodSchema),
  UserControllers.updateUser,
);

export const UserRoutes = router;
