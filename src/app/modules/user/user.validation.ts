import z from 'zod';
import { Role } from './user.interfaces';

export const createUserZodSchema = z.object({
  name: z
    .string({ message: 'Name must be a string' })
    .min(5, { message: 'Name length must be at least 5 characters' })
    .max(100, { message: 'Name length must not exceed 100 characters' }),

  email: z
    .string({ message: 'Email must be a string' })
    .email({ message: 'Invalid email address format' })
    .min(5, { message: 'Email length must be at least 5 characters' })
    .max(100, { message: 'Email length must not exceed 100 characters' }),

  password: z
    .string({ message: 'Password must be a string' })
    .min(8, { message: 'Password must be at least 8 characters long' }),
  // .regex(/(?=.*[A-Z])/, {
  //   message: 'Password must include at least one uppercase letter',
  // })
  // .regex(/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, {
  //   message: 'Password must include at least one special character',
  // })
  // .regex(/(?=.*\d)/, {
  //   message: 'Password must include at least one number',
  // }),

  role: z.enum(Object.values(Role) as [string]).optional(),
});

export const updateUserZodSchema = z.object({
  name: z
    .string({ message: 'Name must be a string' })
    .min(5, { message: 'Name length must be at least 5 characters' })
    .max(100, { message: 'Name length must not exceed 100 characters' })
    .optional(),

  // Password validation moved to a separate route, as noted
  role: z.enum(Object.values(Role) as [string]).optional(),

  picture: z.string({ message: 'Picture must be a string' }).optional(),

  isDeleted: z
    .boolean({ message: 'isDeleted must be a boolean value' })
    .optional(),

  isBlocked: z
    .boolean({ message: 'isBlocked must be a boolean value' })
    .optional(),

  isVerified: z
    .boolean({ message: 'isVerified must be a boolean value' })
    .optional(),
});
