import { HttpError } from '../utils/httpError.js';

export function errorHandler(err, _req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof HttpError) {
    const payload = {
      error: {
        message: err.message,
        code: err.code,
      },
    };

    if (err.details) {
      payload.error.details = err.details;
    }

    return res.status(err.status).json(payload);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { message: 'Invalid JSON body', code: 'INVALID_JSON' },
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: { message: 'Resource already exists', code: 'CONFLICT' },
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: { message: 'Resource not found', code: 'NOT_FOUND' },
    });
  }

  console.error(err);

  return res.status(500).json({
    error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
  });
}
