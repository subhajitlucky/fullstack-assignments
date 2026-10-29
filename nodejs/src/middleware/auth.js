import { verifyToken } from '../utils/jwt.js';
import { HttpError } from '../utils/httpError.js';

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return next(new HttpError(401, 'Authentication required', 'UNAUTHORIZED'));
  }

  try {
    const payload = verifyToken(token);

    if (!payload.sub || typeof payload.sub !== 'string') {
      return next(new HttpError(401, 'Invalid token payload', 'INVALID_TOKEN'));
    }

    // The employee id always comes from the verified JWT, never from the request.
    req.user = { id: payload.sub };
    return next();
  } catch {
    return next(new HttpError(401, 'Invalid or expired token', 'INVALID_TOKEN'));
  }
}
