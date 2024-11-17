import * as Joi from '@hapi/joi';

export const configurationSchema = Joi.object({
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_DB: Joi.string().required(),
  REDIS_HOST_1: Joi.string().required(),
  REDIS_PORT_1: Joi.number().default(6379),
  REDIS_HOST_2: Joi.string().required(),
  REDIS_PORT_2: Joi.number().default(6379),
  REDIS_HOST_3: Joi.string().required(),
  REDIS_PORT_3: Joi.number().default(6379),
  APP_HOST: Joi.string().required(),
  APP_PORT: Joi.number().required(),
  APP_REQ_TIMEOUT: Joi.number().required(),
  NATS_HOST: Joi.string().required(),
  NATS_PORT: Joi.number().default(4222),
  SERVICE_REGISTRY_GRPC_URL: Joi.string().required(),
  CACHE_TTL: Joi.number().required(),
});
