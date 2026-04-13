import { Pool, QueryResultRow } from 'pg'

import envs from '../util/environment'
import logger from '../util/logger'

export type DBConnection = Pool

let pool: Pool | undefined

export async function dbConnect() {
  if (pool != null && pool.ended === false) {
    logger.info({
      message: 'DB already connected',
    })
    return
  }

  pool = new Pool({
    host: envs.DATABASE_HOST,
    user: envs.DATABASE_USER,
    port: envs.DATABASE_PORT,
    password: envs.DATABASE_PASSWORD,
    database: envs.DATABASE_DB,
    max: envs.DATABASE_CONNECTIONS_NUMBER,
    connectionTimeoutMillis: envs.DATABASE_TIMEOUT,
    statement_timeout: envs.DATABASE_TIMEOUT,
  })

  pool.on('error', (error) => {
    logger.error({
      message: 'Unexpected error on idle client',
      error: {
        message: error.message,
      },
    })
  })

  logger.info({
    message: 'DB connected',
  })
}

export async function dbDisconnect() {
  if (pool == null || pool.ended === true) {
    logger.info({
      message: 'DB already disconnected',
    })
    return
  }

  await pool.end()
  pool = undefined

  logger.info({
    message: 'DB disconnected',
  })
}

export function getConnection(): DBConnection {
  if (pool == null || pool.ended === true) {
    throw new Error('connection pool not established')
  }
  return pool
}

export async function find<T extends QueryResultRow>(query: string, params?: unknown[]) {
  if (pool == null || pool.ended === true) {
    throw new Error('connection pool not established')
  }
  return pool.query<T>(query, params)
}

export async function findOne<T extends QueryResultRow>(query: string, params?: unknown[]) {
  if (pool == null || pool.ended === true) {
    throw new Error('connection pool not established')
  }

  const { rows } = await pool.query<T>(query, params)

  if (rows.length > 1) {
    throw new Error('Query result has more than one line')
  }

  return rows.at(0)
}
