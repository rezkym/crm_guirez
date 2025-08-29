/**
 * In-memory metrics untuk observability tanpa paket eksternal
 */

interface CounterMetric {
  value: number;
  lastUpdated: Date;
}

interface TimerMetric {
  samples: number[];
  maxSamples: number;
  lastUpdated: Date;
}

export class MetricsService {
  private counters: Map<string, CounterMetric> = new Map();
  private timers: Map<string, TimerMetric> = new Map();

  /**
   * Increment counter
   */
  incrementCounter(name: string, value: number = 1): void {
    const existing = this.counters.get(name);
    
    if (existing) {
      existing.value += value;
      existing.lastUpdated = new Date();
    } else {
      this.counters.set(name, {
        value,
        lastUpdated: new Date()
      });
    }
  }

  /**
   * Get counter value
   */
  getCounter(name: string): number {
    return this.counters.get(name)?.value || 0;
  }

  /**
   * Record timer sample (durasi dalam ms)
   */
  recordTimer(name: string, durationMs: number): void {
    const existing = this.timers.get(name);
    
    if (existing) {
      existing.samples.push(durationMs);
      
      // Keep only last maxSamples for rolling window
      if (existing.samples.length > existing.maxSamples) {
        existing.samples = existing.samples.slice(-existing.maxSamples);
      }
      
      existing.lastUpdated = new Date();
    } else {
      this.timers.set(name, {
        samples: [durationMs],
        maxSamples: 100, // Rolling window of 100 samples
        lastUpdated: new Date()
      });
    }
  }

  /**
   * Get p95 latency untuk timer
   */
  getP95(name: string): number {
    const timer = this.timers.get(name);
    
    if (!timer || timer.samples.length === 0) {
      return 0;
    }

    const sorted = [...timer.samples].sort((a, b) => a - b);
    const p95Index = Math.ceil(sorted.length * 0.95) - 1;
    
    return sorted[p95Index] || 0;
  }

  /**
   * Get average latency untuk timer
   */
  getAverage(name: string): number {
    const timer = this.timers.get(name);
    
    if (!timer || timer.samples.length === 0) {
      return 0;
    }

    const sum = timer.samples.reduce((a, b) => a + b, 0);
    return sum / timer.samples.length;
  }

  /**
   * Log structured metrics event
   */
  logEvent(event: string, data: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      ...data
    };
    
    console.log(JSON.stringify(logEntry));
  }

  /**
   * Get all metrics summary
   */
  getMetricsSummary(): any {
    const counterSummary: any = {};
    const timerSummary: any = {};

    for (const [name, counter] of this.counters.entries()) {
      counterSummary[name] = counter.value;
    }

    for (const [name, timer] of this.timers.entries()) {
      timerSummary[name] = {
        samples: timer.samples.length,
        p95: this.getP95(name),
        avg: this.getAverage(name)
      };
    }

    return {
      counters: counterSummary,
      timers: timerSummary,
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton instance
export const metrics = new MetricsService();

// Counter names untuk auth system
export const AuthMetrics = {
  LOGIN_ATTEMPT_TOTAL: 'auth_login_attempt_total',
  LOGIN_SUCCESS_TOTAL: 'auth_login_success_total', 
  LOGIN_LOCKOUT_TOTAL: 'auth_login_lockout_total',
  TOKEN_ISSUED_TOTAL: 'auth_token_issued_total',
  TOKEN_REFRESH_TOTAL: 'auth_token_refresh_total',
  TOKEN_REVOKED_TOTAL: 'auth_token_revoked_total'
} as const;

// Timer names untuk auth system
export const AuthTimers = {
  LOGIN_DURATION: 'auth_login_duration_ms',
  REFRESH_DURATION: 'auth_refresh_duration_ms'
} as const;

// Auth events untuk logging
export const AuthEvents = {
  LOGIN_ATTEMPT: 'auth_login_attempt',
  LOGIN_SUCCESS: 'auth_login_success', 
  LOGIN_LOCKOUT: 'auth_login_lockout',
  TOKEN_REFRESH: 'auth_token_refresh',
  REFRESH_REUSE_DETECTED: 'auth_refresh_reuse_detected',
  SESSION_ANOMALY: 'auth_session_anomaly'
} as const;
