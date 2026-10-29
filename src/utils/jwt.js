import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signToken(employeeId) {
  return jwt.sign({ sub: employeeId }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
}
