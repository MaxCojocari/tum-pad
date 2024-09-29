export default () => ({
  environment: process.env.NODE_ENV || 'development',
  app: {
    host: process.env.APP_HOST,
    port: +process.env.APP_PORT,
    grpcUrl: process.env.APP_GRPC_URL,
  },
  bidderServiceGrpc: {
    url: process.env.BIDDER_SERVICE_GRPC_URL,
  },
  database: {
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    db: process.env.POSTGRES_DB,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT || 6379,
  },
});
