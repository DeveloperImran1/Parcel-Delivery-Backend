import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { validateRequest } from '../../middlewares/validationRequest';
import { Role } from '../user/user.interfaces';
import { ParcelController } from './parcel.controller';
import { createParcelZodSchema } from './parcel.validation';
const router = Router();

router.post(
  '/create-parcel',
  checkAuth(Role.SENDER, Role.ADMIN),
  validateRequest(createParcelZodSchema),
  ParcelController.createParcel,
);

router.get('/all-parcel', checkAuth(Role.ADMIN), ParcelController.getAllParcel);

router.get(
  '/my-parcel',
  checkAuth(Role.SENDER, Role.RECEIVER),
  ParcelController.getMyParcel,
);

router.get(
  '/:id',
  checkAuth(...Object.values(Role)),
  ParcelController.getSingleParcel,
);

router.patch(
  '/:id',
  checkAuth(...Object.values(Role)),
  ParcelController.updateParcel,
);

export const ParcelRoutes = router;
