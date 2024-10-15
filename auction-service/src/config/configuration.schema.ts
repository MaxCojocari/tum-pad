import * as Joi from '@hapi/joi';

export const configurationSchema = Joi.object({
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_DB: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  APP_HOST: Joi.string().required(),
  APP_PORT: Joi.number().required(),
  SERVICE_REGISTRY_GRPC_URL: Joi.string().required(),
});
