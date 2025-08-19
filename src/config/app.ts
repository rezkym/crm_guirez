export type AppConfig = {
  port: number;
  apiPrefix: string;
  apiVersion: string;
  nodeEnv: string;
};

function toInt(v: string | undefined, d: number): number {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : d;
}

export const appConfig: AppConfig = Object.freeze({
  port: toInt(process.env.PORT, 3000),
  apiPrefix: process.env.API_PREFIX || '/api',
  apiVersion: process.env.API_VERSION || 'v1',
  nodeEnv: process.env.NODE_ENV || 'development',
});

export default appConfig;