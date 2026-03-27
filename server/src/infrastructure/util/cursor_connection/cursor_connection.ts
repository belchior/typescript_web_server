import { GraphQLError } from 'graphql'

import { stringToBase64, base64ToString } from '../converter'

/**
  forward pagination argument
  first = 3
  after = CURSOR -> 01
  previousPage          nextPage
       |                   |
  |----|----|----|----|----|----|----|----|----|----
  | 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09
  |----|----|----|----|----|----|----|----|----|----
       |    |_____________|
     CURSOR        3

  backward pagination argument
  last   = 3
  before = CURSOR -> 08
                 previousPage          nextPage
                      |                   |
  |----|----|----|----|----|----|----|----|----|----
  | 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09
  |----|----|----|----|----|----|----|----|----|----
                           |_____________||
                                  3     CURSOR
*/

/**
 * CursorConnection
*/
type Edge<T> = {
  cursor: string
  node: T
}
type PageInfo = {
  endCursor: string | undefined
  hasPreviousPage: boolean
  hasNextPage: boolean
  startCursor: string | undefined
}
export type CursorConnection<T> = {
  edges: Edge<T>[]
  pageInfo: PageInfo
}

export type ReferenceFrom<T> = (item: T) => string

export type CursorConnectionArgs<T> = {
  items: T[]
  referenceFrom: ReferenceFrom<T>
  hasPreviousPage: boolean
  hasNextPage: boolean
}

const referenceToCursor = stringToBase64

export function cursorToReference(cursor: string) {
  const reference = base64ToString(cursor)
  return reference.replace(/[']/g, "''"); // eslint-disable-line
}

function toEdges<T>(args: CursorConnectionArgs<T>) {
  const { items, referenceFrom } = args

  const edges: Edge<T>[] = items.map(item => ({
    cursor: referenceToCursor(referenceFrom(item)),
    node: item,
  }))

  return edges
}

function toPageInfo<T>(args: CursorConnectionArgs<T>) {
  const { hasPreviousPage, hasNextPage, items, referenceFrom } = args

  const firstItem = items.at(0)
  const lastItem = items.at(-1)

  const endCursor = lastItem
    ? referenceToCursor(referenceFrom(lastItem))
    : undefined
  const startCursor = firstItem
    ? referenceToCursor(referenceFrom(firstItem))
    : undefined

  const pageInfo: PageInfo = {
    endCursor,
    hasNextPage,
    hasPreviousPage,
    startCursor,
  }

  return pageInfo
}

export function emptyCursorConnection<T>() {
  const emptyConnection: CursorConnection<T> = {
    edges: [],
    pageInfo: {
      endCursor: undefined,
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: undefined,
    },
  }

  return emptyConnection
}

export function cursorConnection<T>(args: CursorConnectionArgs<T>) {
  const edges = toEdges(args)
  const pageInfo = toPageInfo(args)
  const cursor: Readonly<CursorConnection<T>> = { edges, pageInfo }
  return cursor
}

/**
 * Pagination Arguments
*/

export type BackwardPagination = { last?: number, before?: string }
export type ForwardPagination = { first?: number, after?: string }
export type PaginationArguments = ForwardPagination & BackwardPagination

export function validateArgs(args: PaginationArguments) {
  type PaginationArgumentsMixed = Partial<ForwardPagination & BackwardPagination>

  function testPaginationBoundaries(args: PaginationArgumentsMixed) {
    if (
      typeof args != 'object' ||
      (args.first == null && args.last == null)
    ) {
      throw new GraphQLError('Missing pagination boundaries')
    }
  }

  function testLimit(args: PaginationArgumentsMixed) {
    if (args.first != null && args.last != null) throw new GraphQLError(
      'first and last must not be specified at the same time'
    )
    const limit = args.first ?? args.last
    if (typeof limit !== 'number' || limit <= 0 || Number.isSafeInteger(limit) === false) throw new GraphQLError(
      'first and last must be a positive integer'
    )
  }

  function testReference(args: PaginationArgumentsMixed) {
    if (args.before != null && args.after != null) throw new GraphQLError(
      'before and after must not be specified at the same time'
    )
  }

  function testArgumentConsistency(args: PaginationArgumentsMixed) {
    if (args.first != null && args.before != null) throw new GraphQLError(
      'first must be used with after but receive before instead'
    )
    if (args.last != null && args.after != null) throw new GraphQLError(
      'last must be used with before but receive after instead'
    )
    const cursor = args.before ?? args.after
    if (cursor != null && (typeof cursor !== 'string' || cursor === '')) throw new GraphQLError(
      'before and after must be non empty string'
    )
  }

  testPaginationBoundaries(args)
  testLimit(args)
  testReference(args)
  testArgumentConsistency(args)
  return args
}