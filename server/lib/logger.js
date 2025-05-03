import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

const logFormat = printf(({ message }) => {
  return `${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' }),
  ],
});

export default logger;
