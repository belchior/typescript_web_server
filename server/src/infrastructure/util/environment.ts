
export default {
  CLIENT_URL: process.env.CLIENT_URL,
  LOG_LEVEL: process.env.LOG_LEVEL,
  NODE_ENV: process.env.NODE_ENV,
  POSTGRES_CONNECTIONS_NUMBER: Number(process.env.POSTGRES_CONNECTIONS_NUMBER),
  POSTGRES_DB: process.env.POSTGRES_DB,
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_PORT: Number(process.env.POSTGRES_PORT),
  POSTGRES_TIMEOUT: Number(process.env.POSTGRES_TIMEOUT),
  POSTGRES_USER: process.env.POSTGRES_USER,
  SERVER_HOST: process.env.SERVER_HOST,
  SERVER_NAME: process.env.SERVER_NAME,
  SERVER_PORT: Number(process.env.SERVER_PORT),
  SERVER_URL: `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`,
}
