import * as db from '../../../src/infrastructure/database/db_connection'

describe('DB Connection', () => {
  it('should establish a database connection', async () => {
    await db.dbConnect()
    const conn = db.getConnection()
    const result = await conn.query('select 1 + 1 as calc')
    await db.dbDisconnect()

    expect(result).toEqual(expect.objectContaining({
      rows: [
        { calc: 2 },
      ],
    }))
  })

  it('db.find should execute a query using the current connection pool', async () => {
    await db.dbConnect()
    const result = await db.find('select 1 + 1 as calc')
    await db.dbDisconnect()

    expect(result).toEqual(expect.objectContaining({
      rows: [
        { calc: 2 },
      ],
    }))
  })

  it('when try to establish the connection more than one time should have no side effect', async () => {
    await db.dbConnect()
    await db.dbConnect()
    const result = await db.find('select 1 + 1 as calc')
    await db.dbDisconnect()

    expect(result).toEqual(expect.objectContaining({
      rows: [
        { calc: 2 },
      ],
    }))
  })

  it('when try to disconnect more than one time should have no side effect', async () => {
    await db.dbConnect()
    const result = await db.find('select 1 + 1 as calc')
    await db.dbDisconnect()
    await db.dbDisconnect()

    expect(result).toEqual(expect.objectContaining({
      rows: [
        { calc: 2 },
      ],
    }))
  })

  it('should throw an error when try to acquire a connection without establish one first', async () => {
    expect(() => db.getConnection()).toThrow('connection pool not established')
  })

  it('should throw an error when try execute a query without establish a connection first', async () => {
    const promise = db.find('select 1 + 1 as calc')
    await expect(promise).rejects.toThrow('connection pool not established')
  })
})