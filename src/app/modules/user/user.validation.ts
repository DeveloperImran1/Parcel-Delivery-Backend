import z from 'zod';

export const createUserZodSchema = z.object({
  name: z
    .string({ message: 'Name must have been string' })
    .min(1, { message: 'Name lenght is minimum 5' })
    .max(100, { message: 'Name length maximum 100' }),
  email: z
    .string({ message: 'Email must have been string' })
    .email({ message: 'Invalid email address format' })
    .min(5, { message: 'Email lenght is minimum 5' })
    .max(100, { message: 'Email length maximum 100' }),
  password: z
    .string({ message: 'Password must be a string' })
    .min(8, { message: 'Password must have 8 charecter long' })
    .regex(/(?=.*[A-Z])/, {
      message: 'Password include atleast 1 uppercase',
    })
    .regex(/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, {
      message: 'Password include atleast special charrecter',
    })
    .regex(/(?=.*\d)/, { message: 'Password include atleast 1 number' }),
  phone: z
    .string({ message: 'Phone number must be string' })
    .regex(/^(?:\+88|88)?01[3-9]\d{8}$/, {
      message: 'Invalid Phone number',
    })
    .optional(),
  address: z
    .string({ message: 'Address must have string' })
    .max(200, { message: 'Address length maximum 200 charrecter' })
    .optional(),
});
