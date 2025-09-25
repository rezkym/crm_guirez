import { healthService, HealthStatus } from './health.service';

describe('HealthService', () => {
  it('should return status ok and uptime as a number', () => {
    const status: HealthStatus = healthService.getStatus();

    expect(status.status).toBe('ok');
    expect(typeof status.uptimeSeconds).toBe('number');
    expect(status.uptimeSeconds).toBeGreaterThan(0);
  });
});
