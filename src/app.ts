import express from 'express';
import { rootRouter } from './router';

/**
 * App Bootstrap
 * - Fokus API saja
 * - Middleware minimal untuk JSON
 * - Router utama dipasang pada prefix /api
 */
const app: express.Application = express();

app.use(express.json());
app.use('/api', rootRouter);

export { app };
export default app;