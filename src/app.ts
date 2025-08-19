import express from 'express';
import { rootRouter } from './router';
import { requestId, notFoundHandler } from './core/middleware';
import { errorHandler } from './core/http';

const app: express.Application = express();

app.use(express.json());
app.use(requestId());
app.use('/api', rootRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
export default app;