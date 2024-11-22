export default () => ({
  environment: process.env.NODE_ENV || 'development',
  app: {
    host: process.env.APP_HOST,
    port: +process.env.APP_PORT,
    reqTimeout: +process.env.APP_REQ_TIMEOUT,
  },
  database: {
    auction: {
      host: process.env.AUCTION_PG_HOST,
      port: +process.env.AUCTION_PG_PORT || 5432,
      user: process.env.AUCTION_PG_USER,
      password: process.env.AUCTION_PG_PASSWORD,
      db: process.env.AUCTION_PG_DB,
    },
    bidder: {
      host: process.env.BIDDER_PG_HOST,
      port: +process.env.BIDDER_PG_PORT || 5432,
      user: process.env.BIDDER_PG_USER,
      password: process.env.BIDDER_PG_PASSWORD,
      db: process.env.BIDDER_PG_DB,
    },
  },
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
});
