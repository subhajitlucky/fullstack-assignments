import { z } from 'zod';

export const createEnquirySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('A valid email is required').max(255),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((value) => value || undefined),
  courseInterest: z
    .string()
    .trim()
    .min(2, 'Course interest is required')
    .max(200),
  message: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => value || undefined),
});

export const enquiryIdSchema = z.object({
  id: z.string().uuid('Enquiry id must be a valid UUID'),
});

export const listEnquiriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
