import { Document, ObjectId } from 'mongodb'

import { getCollection } from '../db_connection'
import { HasPage, ReferenceFrom } from '../util/types'
import { paginationArgsToQueryArgs } from '../util/pagination'
import { PaginationArguments } from '../../util/cursor_connection/cursor_connection'
import { projectRepositoryDocument } from '../util/project_type'

export type RepositoryDocument = Document & {
  _id: ObjectId
  created_at: Date
  description?: string
  fork_count: number
  license_info: License
  name: string
  owner: RepositoryOwner
  primary_language: Language
  star_count: number
  url: string
}

type License = {
  name: string
}

type Language = {
  color: string
  name: string
}

type RepositoryOwner = {
  _id?: ObjectId
  login: string
  ref: 'users' | 'organizations'
}

export async function findRepositoriesByLogin(login: string, args: PaginationArguments) {
  const { limit, sort, reference, operator } = paginationArgsToQueryArgs(args)

  const query: Document[] = [
    { $match: { 'owner.login': login } },
    { $sort: { created_at: sort } },
    ...(reference
      ? [{ $match: { 'created_at': { [operator]: new Date(reference) } } }]
      : []
    ),
    { $limit: limit },
    { $sort: { created_at: 1 } },
    {
      $project: projectRepositoryDocument(),
    },
  ]

  const result = await getCollection<RepositoryDocument>('repositories')
    .aggregate<RepositoryDocument>(query)
    .toArray()

  return result
}

export async function findRepositoriesPageInfo<T>(
  login: string,
  items: T[],
  referenceFrom: ReferenceFrom<T>
) {
  const referencePrev = referenceFrom(items.at(0)!)
  const referenceNext = referenceFrom(items.at(-1)!)

  const query: Document[] = [
    {
      $facet: {
        previous: [
          { $match: { 'owner.login': login } },
          { $sort: { created_at: 1 } },
          { $match: { created_at: { $lt: new Date(referencePrev) } } },
          { $limit: 1 },
        ],
        next: [
          { $match: { 'owner.login': login } },
          { $sort: { created_at: 1 } },
          { $match: { created_at: { $gt: new Date(referenceNext) } } },
          { $limit: 1 },
        ],
      },
    },
    {
      $project: {
        hasPreviousPage: {
          $cond: [{ $gt: [{ $size: '$previous' }, 0] }, true, false],
        },
        hasNextPage: {
          $cond: [{ $gt: [{ $size: '$next' }, 0] }, true, false],
        },
      },
    },
  ]

  const result = await getCollection<RepositoryDocument>('repositories')
    .aggregate<HasPage>(query)
    .toArray()

  return result.at(0)!
}
