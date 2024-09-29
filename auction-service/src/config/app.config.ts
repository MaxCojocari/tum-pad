export default () => ({
  environment: process.env.NODE_ENV || 'development',
  app: {
    host: process.env.APP_HOST,
    port: +process.env.APP_PORT,
  },
  bidderServiceGrpc: {
    host: process.env.BIDDER_SERVICE_GRPC_HOST,
    port: +process.env.BIDDER_SERVICE_GRPC_PORT,
  },
  database: {
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT || 5432,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT || 6379,
  },
});
