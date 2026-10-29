import { Router } from 'express';
import {
  claimEnquiry,
  createEnquiry,
  listMine,
  listUnclaimed,
} from '../controllers/enquiry.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createEnquirySchema,
  enquiryIdSchema,
  listEnquiriesQuerySchema,
} from '../validators/enquiry.validator.js';

export const enquiryRouter = Router();

// Public form: deliberately no auth middleware.
enquiryRouter.post('/', validate(createEnquirySchema), asyncHandler(createEnquiry));

// "Unclaimed" and "public" mean the same pool; both paths are accepted.
enquiryRouter.get(
  ['/unclaimed', '/public'],
  requireAuth,
  validate(listEnquiriesQuerySchema, 'query'),
  asyncHandler(listUnclaimed),
);

enquiryRouter.get(
  '/my',
  requireAuth,
  validate(listEnquiriesQuerySchema, 'query'),
  asyncHandler(listMine),
);

enquiryRouter.post(
  '/:id/claim',
  requireAuth,
  validate(enquiryIdSchema, 'params'),
  asyncHandler(claimEnquiry),
);
