
export default {
  CLIENT_URL: process.env.CLIENT_URL,
  LOG_LEVEL: process.env.LOG_LEVEL,
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_DB: process.env.DATABASE_DB,
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_PORT: Number(process.env.DATABASE_PORT),
  DATABASE_USER: process.env.DATABASE_USER,
  SERVER_HOST: process.env.SERVER_HOST,
  SERVER_NAME: process.env.SERVER_NAME,
  SERVER_PORT: Number(process.env.SERVER_PORT),
  SERVER_URL: `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`,
}
