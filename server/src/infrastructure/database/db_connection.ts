import { ClientSession, Db, Document, MongoClient } from 'mongodb'

import envs from '../util/environment'
import logger from '../util/logger'
import { Colls } from './util/types'

let client: MongoClient | undefined
let db: Db | undefined

export async function dbConnect() {
  if (client != null) {
    logger.info({
      message: 'DB already connected',
    })
    return
  }

  const connectionString =
    `mongodb://${envs.DATABASE_USER}:${envs.DATABASE_PASSWORD}`
    + `@${envs.DATABASE_HOST}:${envs.DATABASE_PORT}`
    + `/${envs.DATABASE_DB}`
    + '?authSource=admin'

  client = new MongoClient(connectionString)
  await client.connect()
  client.on('error', (error) => {
    logger.error({
      message: 'Unexpected error on client',
      error: {
        message: error.message,
      },
    })
  })

  db = client.db(envs.DATABASE_DB)

  logger.info({
    message: 'DB connected',
  })
}

export async function dbDisconnect() {
  if (client == null) {
    logger.info({
      message: 'DB already disconnected',
    })
    return
  }

  await client.close()
  client = undefined
  db = undefined

  logger.info({
    message: 'DB disconnected',
  })
}

export function getConnection() {
  if (client == null || db == null) {
    throw new Error('connection client not established')
  }
  return db
}

export function getCollection<T extends Document>(coll: Colls) {
  return getConnection().collection<T>(coll)
}

export async function startTransaction(fn: (session: ClientSession) => Promise<void>) {
  if (client == null) {
    throw new Error('The database client must be initialized before use')
  }

  const session = client.startSession()
  try {
    await session.withTransaction(() => fn(session))
  } catch (error) {
    throw error as Error
  } finally {
    session?.endSession()
  }
}
