import database from '../../../src/infrastructure/database'

describe('DB Connection', () => {
  it('should establish a database connection', async () => {
    await database.dbConnect()
    const conn = database.getConnection()
    const result = await conn.collection('users').findOne({}, { projection: { sum: { $sum: [ 1, 1 ] }, _id: 0 } })

    await database.dbDisconnect()

    expect(result).toEqual({ sum: 2 })
  })

  it('when try to establish the connection more than one time should have no side effect', async () => {
    await database.dbConnect()
    await database.dbConnect()
    const result = await database.getCollection('users').findOne({}, { projection: { sum: { $sum: [ 1, 1 ] }, _id: 0 } })
    await database.dbDisconnect()

    expect(result).toEqual({ sum: 2 })
  })

  it('when try to disconnect more than one time should have no side effect', async () => {
    await database.dbConnect()
    const result = await database.getCollection('users').findOne({}, { projection: { sum: { $sum: [ 1, 1 ] }, _id: 0 } })
    await database.dbDisconnect()
    await database.dbDisconnect()

    expect(result).toEqual({ sum: 2 })
  })

  it('should throw an error when try to acquire a connection without establish one first', async () => {
    expect(() => database.getConnection()).toThrow('connection client not established')
  })
})
