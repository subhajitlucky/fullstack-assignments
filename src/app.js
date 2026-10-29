import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { enquiryRouter } from './routes/enquiry.routes.js';
import { HttpError } from './utils/httpError.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRouter);
app.use('/api/enquiries', enquiryRouter);

app.use((_req, _res, next) => {
  next(new HttpError(404, 'Route not found', 'ROUTE_NOT_FOUND'));
});

app.use(errorHandler);

export default app;
