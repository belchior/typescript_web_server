import { Document, ObjectId } from 'mongodb'

import { CollRef, HasPage, ReferenceFrom } from '../util/types'
import { getCollection } from '../db_connection'
import { OrganizationDocView } from './organization'
import { paginationArgsToQueryArgs } from '../util/pagination'
import { PaginationArguments } from '../../util/cursor_connection/cursor_connection'
import { RepositoryDocument } from './repository'
import { projectStarredRepository, projectUserOrganization, projectUserDocView } from '../util/project_type'

export type UserDocument = Document & {
  _id: ObjectId
  avatar_url: string
  bio?: string
  company?: string
  created_at: Date
  email: string
  followers: CollRef<'users'>[]
  following: CollRef<'users'>[]
  location?: string
  login: string
  name?: string
  organizations: CollRef<'organizations'>[]
  starred_repositories: CollRef<'repositories'>[]
  url: string
  website_url?: string
}

type UserSubDocuments =
  | 'followers'
  | 'following'
  | 'organizations'
  | 'starred_repositories'

export type UserDocView = Omit<UserDocument, UserSubDocuments> & {
  ref: 'users'
}

export type FollowingDocView = (UserDocView | OrganizationDocView) & {
  following_at: Date
}

export type UserOrganizationDocView = OrganizationDocView & { joined_at: Date }

export type StarredRepository = RepositoryDocument & { starred_at: Date }

export async function findOneByLogin(login: string) {
  const result = await getCollection<UserDocument>('users')
    .findOne<UserDocView>(
      { login: login },
      {
        projection: projectUserDocView(),
      }
    )

  return result
}

export async function findFollowingByLogin(
  login: string,
  args: PaginationArguments
) {
  const { limit, sort, reference, operator } = paginationArgsToQueryArgs(args)

  const query: Document[] = [
    { $match: { login: login } },
    { $unwind: '$following' },
    { $replaceRoot: { newRoot: '$following' } },
    { $sort: { created_at: sort } },
    ...(reference
      ? [{ $match: { created_at: { [operator]: new Date(reference) } } }]
      : []
    ),
    { $limit: limit },
    { $sort: { created_at: 1 } },
    {
      $lookup: {
        from: 'users',
        as: 'user',
        localField: 'login',
        foreignField: 'login',
      },
    },
    {
      $lookup: {
        from: 'organizations',
        as: 'org',
        localField: 'login',
        foreignField: 'login',
      },
    },
    {
      $replaceWith: {
        $mergeObjects: [
          { ref: '$ref', following_at: '$created_at' },
          { $arrayElemAt: ['$user', 0] },
          { $arrayElemAt: ['$org', 0] },
        ],
      },
    },
    {
      $project: {
        followers: 0,
        following: 0,
        organizations: 0,
        starred_repositories: 0,
      },
    },
  ]

  const result = await getCollection<UserDocument>('users')
    .aggregate<FollowingDocView>(query)
    .toArray()

  return result
}

export async function findFollowingPageInfo<T>(
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
          { $match: { login: login } },
          { $unwind: '$following' },
          { $project: { following_at: '$following.created_at', _id: 0 } },
          { $sort: { following_at: 1 } },
          { $match: { following_at: { $lt: new Date(referencePrev) } } },
          { $limit: 1 },
        ],
        next: [
          { $match: { login: login } },
          { $unwind: '$following' },
          { $project: { following_at: '$following.created_at', _id: 0 } },
          { $sort: { following_at: 1 } },
          { $match: { following_at: { $gt: new Date(referenceNext) } } },
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

  const result = await getCollection<UserDocument>('users')
    .aggregate<HasPage>(query)
    .toArray()

  return result.at(0)!
}

export async function findStarredRepositoriesByLogin(
  login: string,
  args: PaginationArguments
) {
  const { limit, sort, reference, operator } = paginationArgsToQueryArgs(args)

  const query: Document[] = [
    { $match: { login: login } },
    { $unwind: '$starred_repositories' },
    { $replaceRoot: { newRoot: '$starred_repositories' } },
    { $sort: { created_at: sort } },
    ...(reference
      ? [{ $match: { created_at: { [operator]: new Date(reference) } } }]
      : []
    ),
    { $limit: limit },
    { $sort: { created_at: 1 } },
    {
      $lookup: {
        from: 'repositories',
        localField: '_id',
        foreignField: '_id',
        as: 'repository',
      },
    },
    {
      $replaceWith: {
        $mergeObjects: [
          { $arrayElemAt: ['$repository', 0] },
          { starred_at: '$created_at' },
        ],
      },
    },
    {
      $project: projectStarredRepository(),
    },
  ]

  const result = await getCollection<UserDocument>('users')
    .aggregate<StarredRepository>(query)
    .toArray()

  return result
}

export async function findStarredRepositoriesPageInfo<T>(
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
          { $match: { login: login } },
          { $unwind: '$starred_repositories' },
          {
            $project: {
              starred_at: '$starred_repositories.created_at',
              _id: 0,
            },
          },
          { $sort: { starred_at: 1 } },
          { $match: { starred_at: { $lt: new Date(referencePrev) } } },
          { $limit: 1 },
        ],
        next: [
          { $match: { login: login } },
          { $unwind: '$starred_repositories' },
          {
            $project: {
              starred_at: '$starred_repositories.created_at',
              _id: 0,
            },
          },
          { $sort: { starred_at: 1 } },
          { $match: { starred_at: { $gt: new Date(referenceNext) } } },
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

  const result = await getCollection<UserDocument>('users')
    .aggregate<HasPage>(query)
    .toArray()

  return result.at(0)!
}

export async function findUserOrganizationsByLogin(
  login: string,
  args: PaginationArguments
) {
  const { limit, sort, reference, operator } = paginationArgsToQueryArgs(args)

  const query: Document[] = [
    { $match: { login: login } },
    { $unwind: '$organizations' },
    { $replaceRoot: { newRoot: '$organizations' } },
    { $sort: { created_at: sort } },
    ...(reference
      ? [{ $match: { created_at: { [operator]: new Date(reference) } } }]
      : []
    ),
    { $limit: limit },
    { $sort: { created_at: 1 } },
    {
      $lookup: {
        from: 'organizations',
        localField: 'login',
        foreignField: 'login',
        as: 'organization',
      },
    },
    {
      $replaceWith: {
        $mergeObjects: [
          { $arrayElemAt: ['$organization', 0] },
          { joined_at: '$created_at' },
        ],
      },
    },
    {
      $project: projectUserOrganization(),
    },
  ]

  const result = await getCollection<UserDocument>('users')
    .aggregate<UserOrganizationDocView>(query)
    .toArray()

  return result
}

export async function findUserOrganizationsPageInfo<T>(
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
          { $match: { login: login } },
          { $unwind: '$organizations' },
          { $project: { joined_at: '$organizations.created_at', _id: 0 } },
          { $sort: { joined_at: 1 } },
          { $match: { joined_at: { $lt: new Date(referencePrev) } } },
          { $limit: 1 },
        ],
        next: [
          { $match: { login: login } },
          { $unwind: '$organizations' },
          { $project: { joined_at: '$organizations.created_at', _id: 0 } },
          { $sort: { joined_at: 1 } },
          { $match: { joined_at: { $gt: new Date(referenceNext) } } },
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

  const result = await getCollection<UserDocument>('users')
    .aggregate<HasPage>(query)
    .toArray()

  return result.at(0)!
}
