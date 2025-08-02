import { JwtPayload } from 'jsonwebtoken';

// Ai interface kono schema or typesctiper er interface noi. Ai file er code er maddhome req.body jemon pawa jai. Temoni req.user namer akta property set kore dibo.

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}
