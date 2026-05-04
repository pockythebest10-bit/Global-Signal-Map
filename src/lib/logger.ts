export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    console.log(`[INFO] ${message}`, context || '');
  },
  warn: (message: string, context?: Record<string, any>) => {
    console.warn(`[WARN] ${message}`, context || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || '');
  },
  debug: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }
};
