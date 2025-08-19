export type HealthStatus = { status: 'ok'; uptimeSeconds: number };

export const healthService = {
  getStatus(): HealthStatus {
    return { status: 'ok', uptimeSeconds: Math.round(process.uptime()) };
  },
};

export default healthService;