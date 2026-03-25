import database from '../../../src/infrastructure/database'

describe('DB Connection', () => {
  it('should establish a database connection', async () => {
    await database.dbConnect()
    const conn = database.getConnection()
    const result = await conn.query('select 1 + 1 as calc')
    await database.dbDisconnect()

    expect(result).toEqual(expect.objectContaining({
      rows: [
        { calc: 2 },
      ],
    }))
  })

  it('database.find should execute a query using the current connection pool', async () => {
    await database.dbConnect()
    const result = await database.find('select 1 + 1 as calc')
    await database.dbDisconnect()

    expect(result).toEqual(expect.objectContaining({
      rows: [
        { calc: 2 },
      ],
    }))
  })

  it('when try to establish the connection more than one time should have no side effect', async () => {
    await database.dbConnect()
    await database.dbConnect()
    const result = await database.find('select 1 + 1 as calc')
    await database.dbDisconnect()

    expect(result).toEqual(expect.objectContaining({
      rows: [
        { calc: 2 },
      ],
    }))
  })

  it('when try to disconnect more than one time should have no side effect', async () => {
    await database.dbConnect()
    const result = await database.find('select 1 + 1 as calc')
    await database.dbDisconnect()
    await database.dbDisconnect()

    expect(result).toEqual(expect.objectContaining({
      rows: [
        { calc: 2 },
      ],
    }))
  })

  it('should throw an error when try to acquire a connection without establish one first', async () => {
    expect(() => database.getConnection()).toThrow('connection pool not established')
  })

  it('should throw an error when try execute a query without establish a connection first', async () => {
    const promise = database.find('select 1 + 1 as calc')
    await expect(promise).rejects.toThrow('connection pool not established')
  })
})