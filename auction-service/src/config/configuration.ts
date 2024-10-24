export default () => ({
  environment: process.env.NODE_ENV || 'development',
  app: {
    host: process.env.APP_HOST,
    port: +process.env.APP_PORT,
    grpcUrl: process.env.APP_GRPC_URL,
    reqTimeout: +process.env.APP_REQ_TIMEOUT,
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
  serviceRegistryGrpc: {
    url: process.env.SERVICE_REGISTRY_GRPC_URL,
  },
  nats: {
    host: process.env.NATS_HOST,
    port: +process.env.NATS_PORT || 4222,
  },
});
