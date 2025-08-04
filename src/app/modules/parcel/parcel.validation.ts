import { z } from 'zod';

export const createParcelZodSchema = z.object({
  type: z.string(),
  weight: z.number(),
  pickupAddress: z.string(),
  deliveryAddress: z.string(),
  sender: z.string().min(1), // ObjectId as string
  receiver: z.string().min(1), // ObjectId as string
  couponCode: z.string().optional(),
});

export const updateParcelZodSchema = z.object({
  type: z.string().optional(),
  weight: z.number().optional(),
  fee: z.number().optional(),
  deliveryDate: z.string().or(z.date()).optional(),
  pickupAddress: z.string().optional(),
  deliveryAddress: z.string().optional(),
  sender: z.string().optional(),
  receiver: z.string().optional(),
  couponCode: z.string().optional(),
  status: z
    .enum([
      'Requested',
      'Approved',
      'Dispatched',
      'In Transit',
      'Delivered',
      'Cancelled',
    ])
    .optional(),
});
