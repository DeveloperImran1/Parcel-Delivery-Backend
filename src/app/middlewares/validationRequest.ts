import { NextFunction, Request, Response } from 'express';
import { ZodObject, ZodRawShape } from 'zod';

export const validateRequest =
  (zodSchema: ZodObject<ZodRawShape>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // jokhon postman theke form-datar maddhome file and data property er moddhe info gulo send kortesi. Tokhon aikhane req.body er moddhe exact body ke pawa jabena. Tai req.body ke reset korlam req.body.data dia. Ar jeheto form-data theke text akare astece data. Tai string hisabe asce. So sei string data ke JSON.parse() er maddhome json a convert kore nita hobe. Ar jodi req.body.data na thake tar mane aita json akare asce. Tokhon direct zodSchema te check korte pathia dissi.
      if (req.body.data) {
        req.body = JSON.parse(req.body.data);
      }
      req.body = await zodSchema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
