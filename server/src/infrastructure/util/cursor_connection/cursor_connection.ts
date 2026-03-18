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
type TEdge<T> = {
  cursor: string
  node: T
}
type TPageInfo = {
  endCursor: string | undefined
  hasPreviousPage: boolean
  hasNextPage: boolean
  startCursor: string | undefined
}
export type TCursorConnection<T> = {
  edges: TEdge<T>[],
  pageInfo: TPageInfo
}

export type TReferenceFrom<T> = (item: T) => string
export type TPageInfoItem = {
  row: 'prev' | 'next'
}
export type TCursorConnectionArgs<T> = {
  referenceFrom: TReferenceFrom<T>
  items: T[]
  pageInfoItems: TPageInfoItem[]
}

const referenceToCursor = stringToBase64

export function cursorToReference(cursor: string) {
  const reference = base64ToString(cursor)
  return reference.replace(/[']/g, "''"); // eslint-disable-line
}

function itemsToPageInfo<T>(args: TCursorConnectionArgs<T>) {
  const { referenceFrom, items, pageInfoItems } = args

  const firstItem = items.at(0)
  const lastItem = items.at(-1)

  const endCursor = lastItem
    ? referenceToCursor(referenceFrom(lastItem))
    : undefined
  const startCursor = firstItem
    ? referenceToCursor(referenceFrom(firstItem))
    : undefined

  const hasItem = (name: TPageInfoItem['row'], items: TPageInfoItem[]) => items.reduce(
    (acc, item) => (acc === true || item.row === name),
    false
  )

  const pageInfo: TPageInfo = {
    endCursor,
    hasNextPage: hasItem('next', pageInfoItems),
    hasPreviousPage: hasItem('prev', pageInfoItems),
    startCursor,
  }

  return pageInfo
}

function itemsToEdges<T>(items: T[], referenceFrom: TReferenceFrom<T>) {
  const edges: TEdge<T>[] = items.map(item => ({
    cursor: referenceToCursor(referenceFrom(item)),
    node: item,
  }))

  return edges
}

export function emptyCursorConnection<T>() {
  const emptyConnection: TCursorConnection<T> = {
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

export function cursorConnection<T>(args: TCursorConnectionArgs<T>) {
  const edges = itemsToEdges<T>(args.items, args.referenceFrom)
  const pageInfo = itemsToPageInfo<T>(args)
  const cursorConnection: Readonly<TCursorConnection<T>> = { edges, pageInfo }
  return cursorConnection
}

/**
 * Pagination Arguments
*/

export type TBackwardPaginationArgs = { last?: number, before?: string }
export type TForwardPaginationArgs = { first?: number, after?: string }
export type TPaginationArgs = TForwardPaginationArgs & TBackwardPaginationArgs

export function validateArgs(args: TPaginationArgs) {
  type TPaginationArgsMixed = Partial<TForwardPaginationArgs & TBackwardPaginationArgs>

  function testPaginationBoundaries(args: TPaginationArgsMixed) {
    if (
      typeof args != 'object' ||
      (args.first == null && args.last == null)
    ) {
      throw new GraphQLError('Missing pagination boundaries')
    }
  }

  function testLimit(args: TPaginationArgsMixed) {
    if (args.first != null && args.last != null) throw new GraphQLError(
      'first and last must not be specified at the same time'
    )
    const limit = args.first ?? args.last
    if (typeof limit !== 'number' || limit <= 0 || Number.isSafeInteger(limit) === false) throw new GraphQLError(
      'first and last must be a positive integer'
    )
  }

  function testReference(args: TPaginationArgsMixed) {
    if (args.before != null && args.after != null) throw new GraphQLError(
      'before and after must not be specified at the same time'
    )
  }

  function testArgumentConsistency(args: TPaginationArgsMixed) {
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