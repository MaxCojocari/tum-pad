export default () => ({
  environment: process.env.NODE_ENV || 'development',
  app: {
    host: process.env.APP_HOST,
    port: +process.env.APP_PORT,
    grpcUrl: process.env.APP_GRPC_URL,
  },
  auctionServiceGrpc: {
    url: process.env.AUCTION_SERVICE_GRPC_URL,
  },
  database: {
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    db: process.env.POSTGRES_DB,
  },
  serviceRegistryGrpc: {
    url: process.env.SERVICE_REGISTRY_GRPC_URL,
  },
});
