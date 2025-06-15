/**
 * Retry utility for handling transient failures
 * Can be used in both frontend and backend for API calls
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  shouldRetry?: (error: unknown) => boolean;
}

interface NetworkError {
  code?: string;
  response?: {
    status?: number;
    headers?: Record<string, string>;
  };
  status?: number;
  message?: string;
}

export class RetryUtil {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      shouldRetry = (error: unknown): boolean =>
        RetryUtil.defaultShouldRetry(error),
    } = options;

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error: unknown) {
        lastError = error;

        if (attempt === maxAttempts || !shouldRetry(error)) {
          throw error;
        }

        const delay = this.calculateDelay(attempt, baseDelay, maxDelay, error);
        console.warn(
          `Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`,
          { error: this.getErrorMessage(error) },
        );

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private static defaultShouldRetry(error: unknown): boolean {
    const networkError = error as NetworkError;

    // Retry on network errors
    if (
      networkError.code === 'ECONNRESET' ||
      networkError.code === 'ETIMEDOUT'
    ) {
      return true;
    }

    // Retry on 5xx server errors and specific 4xx errors
    const status = networkError.status || networkError.response?.status;
    if (status) {
      return (
        (status >= 500 && status < 600) || // 5xx server errors
        status === 429 || // Rate limiting
        status === 408 || // Request timeout
        status === 423 || // Locked
        status === 503 // Service unavailable
      );
    }

    return false;
  }

  private static calculateDelay(
    attempt: number,
    baseDelay: number,
    maxDelay: number,
    error: unknown,
  ): number {
    const networkError = error as NetworkError;

    // Check for Retry-After header
    const retryAfter = networkError.response?.headers?.['retry-after'];
    if (typeof retryAfter === 'string') {
      const retryAfterMs = parseInt(retryAfter, 10) * 1000;
      return Math.min(retryAfterMs, maxDelay);
    }

    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  private static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
