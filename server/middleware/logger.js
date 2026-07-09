import morgan from 'morgan';

/**
 * Request logging middleware.
 * Uses 'dev' format in development, 'combined' in production.
 */
const logger = (env) => {
  if (env === 'production') {
    return morgan('combined');
  }
  return morgan('dev');
};

export default logger;
