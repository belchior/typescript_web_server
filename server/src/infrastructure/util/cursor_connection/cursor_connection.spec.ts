import { cursorConnection, emptyCursorConnection, TCursorConnectionArgs, TPaginationArgs, validateArgs } from './cursor_connection'

describe('CursorConnection', () => {
  it('should return empty cursor connection', () => {
    let connection = emptyCursorConnection()

    expect(connection).toEqual({
      edges: [],
      pageInfo: {
        endCursor: undefined,
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: undefined,
      },
    })

    type Test = { created_at: Date }
    const args: TCursorConnectionArgs<Test> = {
      referenceFrom: (item) => item.created_at.toString(),
      items: [],
      pageInfoItems: [],
    }
    connection = cursorConnection(args)

    expect(connection).toEqual({
      edges: [],
      pageInfo: {
        endCursor: undefined,
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: undefined,
      },
    })
  })

  it('should return forward cursor connection', () => {
    type Test = { created_at: Date }
    const args: TCursorConnectionArgs<Test> = {
      referenceFrom: (item) => item.created_at.toString(),
      items: [
        { created_at: new Date('2026-01-01T00:00:00.000Z') },
      ],
      pageInfoItems: [
        { row: 'next' },
      ],
    }

    const cursor = 'V2VkIERlYyAzMSAyMDI1IDIxOjAwOjAwIEdNVC0wMzAwIChCcmFzaWxpYSBTdGFuZGFyZCBUaW1lKQ=='
    const connection = cursorConnection(args)
    expect(connection).toEqual({
      edges: [
        {
          cursor,
          node: {
            created_at: new Date('2026-01-01T00:00:00.000Z'),
          },
        },
      ],
      pageInfo: {
        endCursor: cursor,
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: cursor,
      },
    })
  })

  it('should return backward cursor connection', () => {
    type Test = { created_at: Date }
    const args: TCursorConnectionArgs<Test> = {
      referenceFrom: (item) => item.created_at.toString(),
      items: [
        { created_at: new Date('2026-01-01T00:00:00.000Z') },
      ],
      pageInfoItems: [
        { row: 'prev' },
      ],
    }

    const cursor = 'V2VkIERlYyAzMSAyMDI1IDIxOjAwOjAwIEdNVC0wMzAwIChCcmFzaWxpYSBTdGFuZGFyZCBUaW1lKQ=='
    const connection = cursorConnection(args)
    expect(connection).toEqual({
      edges: [
        {
          cursor,
          node: {
            created_at: new Date('2026-01-01T00:00:00.000Z'),
          },
        },
      ],
      pageInfo: {
        endCursor: cursor,
        hasNextPage: false,
        hasPreviousPage: true,
        startCursor: cursor,
      },
    })
  })
})

describe('Pagination Arguments', () => {
  it('should accept a valid forward pagination argument', () => {
    let args: TPaginationArgs = { first: 2 }

    expect(() => validateArgs(args)).not.toThrow()

    args = { first: 2, after: 'opaqueCursor' }
    expect(() => validateArgs(args)).not.toThrow()
  })

  it('should accept a valid backward pagination argument', () => {
    let args: TPaginationArgs = { last: 2 }
    expect(() => validateArgs(args)).not.toThrow()

    args = { last: 2, before: 'opaqueCursor' }
    expect(() => validateArgs(args)).not.toThrow()
  })

  it('should throw an error when the argument are empty', () => {
    const args = {}
    expect(() => validateArgs(args)).toThrow('Missing pagination boundaries')
  })

  it('should throw an error when is passing both first and last', () => {
    const args: TPaginationArgs = { first: 2, last: 2 }
    expect(() => validateArgs(args)).toThrow('first and last must not be specified at the same time')
  })

  it('should throw an error when first or last are not a positive integer', () => {
    let args: TPaginationArgs = { first: -2 }
    expect(() => validateArgs(args)).toThrow('first and last must be a positive integer')

    args = { last: -2 }
    expect(() => validateArgs(args)).toThrow('first and last must be a positive integer')
  })

  it('should throw an error when before or after are defined at the same time', () => {
    const args: TPaginationArgs = { first: 2, before: 'opaqueCursor', after: 'opaqueCursor' }
    expect(() => validateArgs(args)).toThrow('before and after must not be specified at the same time')
  })

  it('should throw an error when first is used with before', () => {
    const args: TPaginationArgs = { first: 2, before: 'opaqueCursor' }
    expect(() => validateArgs(args)).toThrow('first must be used with after but receive before instead')
  })

  it('should throw an error when last is used with after', () => {
    const args: TPaginationArgs = { last: 2, after: 'opaqueCursor' }
    expect(() => validateArgs(args)).toThrow('last must be used with before but receive after instead')
  })

  it('should throw an error when before or after are empty string', () => {
    let args: TPaginationArgs = { last: 2, before: '' }
    expect(() => validateArgs(args)).toThrow('before and after must be non empty string')

    args = { first: 2, after: '' }
    expect(() => validateArgs(args)).toThrow('before and after must be non empty string')
  })
})