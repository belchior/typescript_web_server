import { Document } from 'mongodb'

import { getCollection } from '../db_connection'
import { HasPage, ReferenceFrom } from '../util/types'
import { OrganizationDocument } from './organization'
import { paginationArgsToQueryArgs } from '../util/pagination'
import { PaginationArguments } from '../../util/cursor_connection/cursor_connection'
import { UserDocument, UserDocView } from './user'
import { projectFollower } from '../util/project_type'

export type FollowerDocView = UserDocView & { followed_at: Date }

export async function findFollowersByUserLogin(login: string, args: PaginationArguments, coll: 'users' | 'organizations') {
  const { limit, sort, reference, operator } = paginationArgsToQueryArgs(args)

  const query: Document[] = [
    { $match: { login: login } },
    { $unwind: '$followers' },
    { $replaceRoot: { newRoot: '$followers' } },
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
        localField: 'login',
        foreignField: 'login',
        as: 'follower',
      },
    },
    {
      $replaceWith: {
        $mergeObjects: [
          { $arrayElemAt: ['$follower', 0] },
          { followed_at: '$created_at' },
        ],
      },
    },
    {
      $project: projectFollower(),
    },
  ]

  const collection = coll === 'organizations'
    ? getCollection<OrganizationDocument>('organizations')
    : getCollection<UserDocument>('users')

  const result = await collection.aggregate<FollowerDocView>(query).toArray()
  return result
}

export async function findFollowersPageInfo<T>(
  login: string,
  items: T[],
  referenceFrom: ReferenceFrom<T>,
  coll: 'users' | 'organizations'
) {
  const referencePrev = referenceFrom(items.at(0)!)
  const referenceNext = referenceFrom(items.at(-1)!)

  const query: Document[] = [
    {
      $facet: {
        previous: [
          { $match: { login: login } },
          { $unwind: '$followers' },
          { $project: { followed_at: '$followers.created_at', _id: 0 } },
          { $sort: { followed_at: 1 } },
          { $match: { followed_at: { $lt: new Date(referencePrev) } } },
          { $limit: 1 },
        ],
        next: [
          { $match: { login: login } },
          { $unwind: '$followers' },
          { $project: { followed_at: '$followers.created_at', _id: 0 } },
          { $sort: { followed_at: 1 } },
          { $match: { followed_at: { $gt: new Date(referenceNext) } } },
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

  const collection = coll === 'organizations'
    ? getCollection<OrganizationDocument>('organizations')
    : getCollection<UserDocument>('users')

  const result = await collection.aggregate<HasPage>(query).toArray()

  return result.at(0)!
}
