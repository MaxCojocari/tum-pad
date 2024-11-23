import * as Joi from '@hapi/joi';

export const configurationSchema = Joi.object({
  AUCTION_PG_USER: Joi.string().required(),
  AUCTION_PG_PASSWORD: Joi.string().required(),
  AUCTION_PG_HOST: Joi.string().required(),
  AUCTION_PG_PORT: Joi.number().default(5432),
  AUCTION_PG_DB: Joi.string().required(),
  BIDDER_PG_USER: Joi.string().required(),
  BIDDER_PG_PASSWORD: Joi.string().required(),
  BIDDER_PG_HOST: Joi.string().required(),
  BIDDER_PG_PORT: Joi.number().default(5432),
  BIDDER_PG_DB: Joi.string().required(),
  APP_HOST: Joi.string().required(),
  APP_PORT: Joi.number().required(),
  APP_REQ_TIMEOUT: Joi.number().required(),
  BIDDER_MONGODB_URI: Joi.string().required(),
  DATA_WAREHOUSE_MONGODB_URI: Joi.string().required(),
});
