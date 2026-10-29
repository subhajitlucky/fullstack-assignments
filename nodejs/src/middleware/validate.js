import { HttpError } from '../utils/httpError.js';

const destinationKeys = {
  body: 'validatedBody',
  query: 'validatedQuery',
  params: 'validatedParams',
};

export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      return next(new HttpError(400, 'Validation failed', 'VALIDATION_ERROR', details));
    }

    req[destinationKeys[source]] = result.data;
    return next();
  };
}
