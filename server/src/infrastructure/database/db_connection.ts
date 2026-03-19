import { Pool, QueryResult, QueryResultRow } from 'pg'

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
    host: envs.POSTGRES_HOST,
    user: envs.POSTGRES_USER,
    port: envs.POSTGRES_PORT,
    password: envs.POSTGRES_PASSWORD,
    database: envs.POSTGRES_DB,
    max: envs.POSTGRES_CONNECTIONS_NUMBER,
    connectionTimeoutMillis: envs.POSTGRES_TIMEOUT,
    statement_timeout: envs.POSTGRES_TIMEOUT,
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
  return pool!
}

export async function find<T extends QueryResultRow>(query: string, args?: unknown[]): Promise<QueryResult<T>> {
  if (pool == null || pool.ended === true) {
    throw new Error('connection pool not established')
  }
  return pool.query(query, args)
}