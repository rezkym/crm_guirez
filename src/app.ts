import express from "express";
import { rootRouter } from "./router";
import { requestId, notFoundHandler } from "./core/middleware";
import { errorHandler } from "./core/http";
import { appConfig } from "./config";

const app: express.Application = express();

// Middleware setup
app.use(express.json());
app.use(requestId());

// Setup router
app.use(appConfig.apiPrefix, rootRouter);

// Global error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
export default app;
