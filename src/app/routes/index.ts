import { Router } from 'express';
import { AuthRoutes } from '../modules/auths/auth.route';
import { OtpRoutes } from '../modules/otp/otp.route';
import { ParcelRoutes } from '../modules/parcel/parcel.route';
import { StatsRoutes } from '../modules/stats/stats.route';
import { UserRoutes } from '../modules/user/user.route';

export const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/otp',
    route: OtpRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/parcel',
    route: ParcelRoutes,
  },
  {
    path: '/stats',
    route: StatsRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
