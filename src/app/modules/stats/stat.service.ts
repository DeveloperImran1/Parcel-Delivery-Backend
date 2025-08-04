import { Parcel } from '../parcel/parcel.model';
import { User } from '../user/user.model';

const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7); // ajker date theke 7 din ager date ke get korbe.
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);

const getUserStats = async () => {
  // ai query gulote await use korini. Karon aisob gulo promise return korabo. And sobar last a await Promise.all([]) er moddhe aksathe promise gulo ke resolve korbo.
  const totalUsersPromise = User.countDocuments();

  const totalVerifiedUsesrPromise = User.countDocuments({
    isVerified: true,
  });
  const totalBlockedUsesrPromise = User.countDocuments({
    isBlocked: true,
  });
  const totalDeletedUsesrPromise = User.countDocuments({
    isDeleted: true,
  });

  const newUsersInLast7DaysPromise = User.countDocuments({
    createdAt: { $gte: sevenDaysAgo }, // aikhane createdAt er value jeigulo sevenDaysAgo theke boro, seigulo get korbo. Karon din joto jasse, total milisecond toto besi hosse.
  });

  const newUsersInLast30DaysPromise = User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const usersByRolePromise = User.aggregate([
    // Stage 1: grouping by user role and count total users in eacy role
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);

  const [
    totalUsers,
    totalVerifiedUsesr,
    totalBlockedUsesr,
    totalDeletedUsesr,
    newUsersInLast7Days,
    newUsersInLast30Days,
    usersByRole,
  ] = await Promise.all([
    totalUsersPromise,
    totalVerifiedUsesrPromise,
    totalBlockedUsesrPromise,
    totalDeletedUsesrPromise,
    newUsersInLast7DaysPromise,
    newUsersInLast30DaysPromise,
    usersByRolePromise,
  ]);

  return {
    totalUsers,
    totalVerifiedUsesr,
    totalBlockedUsesr,
    totalDeletedUsesr,
    newUsersInLast7Days,
    newUsersInLast30Days,
    usersByRole,
  };
};

const getParcelStats = async () => {
  const totalParcelPromise = Parcel.countDocuments().lean(); // last a .lean() use korle aro better hoi.

  const totalRequestedParcelPromise = Parcel.countDocuments({
    status: 'Requested',
  });
  const totalDispatchedParcelPromise = Parcel.countDocuments({
    status: 'Dispatched',
  });
  const totalDeliveredParcelPromise = Parcel.countDocuments({
    status: 'Delivered',
  });
  const totalCancelledParcelPromise = Parcel.countDocuments({
    status: 'Cancelled',
  });

  const newParcelInLast7DaysPromise = Parcel.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  const newParcelInLast30DaysPromise = User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const [
    totalParcel,
    totalRequestedParcel,
    totalDispatchedParcel,
    totalDeliveredParcel,
    totalCancelledParcel,
    newParcelInLast7Days,
    newParcelInLast30Days,
  ] = await Promise.all([
    totalParcelPromise,
    totalRequestedParcelPromise,
    totalDispatchedParcelPromise,
    totalDeliveredParcelPromise,
    totalCancelledParcelPromise,
    newParcelInLast7DaysPromise,
    newParcelInLast30DaysPromise,
  ]);
  return {
    totalParcel,
    totalRequestedParcel,
    totalDispatchedParcel,
    totalDeliveredParcel,
    totalCancelledParcel,
    newParcelInLast7Days,
    newParcelInLast30Days,
  };
};

export const StatsServices = {
  getUserStats,
  getParcelStats,
};
