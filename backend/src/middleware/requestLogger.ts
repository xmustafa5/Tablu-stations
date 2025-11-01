import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req: Request, res: Response) => {
  const responseTime = res.get('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Custom format for request logging
const logFormat = ':method :url :status :response-time ms - :res[content-length]';

// Development logger with colors
const developmentLogger = morgan('dev');

// Production logger with more detailed information
const productionLogger = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
  {
    skip: (req: Request) => {
      // Skip logging for health check endpoint in production
      return req.url === '/health';
    }
  }
);

// Export the appropriate logger based on environment
export const requestLogger = process.env.NODE_ENV === 'production'
  ? productionLogger
  : developmentLogger;

// Custom middleware for detailed logging
export const detailedLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Request Log:', JSON.stringify(logData, null, 2));
    } else {
      console.log(JSON.stringify(logData));
    }
  });

  next();
};
