import { Document, ObjectId } from 'mongodb'

import { CollRef, HasPage, ReferenceFrom } from '../util/types'
import { getCollection } from '../db_connection'
import { paginationArgsToQueryArgs } from '../util/pagination'
import { PaginationArguments } from '../../util/cursor_connection/cursor_connection'
import { UserDocView } from './user'
import { projectOrganizationMember, projectOrganizationDocView } from '../util/project_type'

export type OrganizationDocument = Document & {
  _id: ObjectId
  avatar_url: string
  created_at: Date
  description?: string
  email?: string
  followers: CollRef<'users'>[]
  location?: string
  login: string
  name?: string
  members: CollRef<'users'>[]
  url: string
  website_url?: string
}

type OrganizationSubDocument =
  | 'followers'
  | 'members'

export type OrganizationDocView = Omit<OrganizationDocument, OrganizationSubDocument> & {
  ref: 'organizations'
}

export type OrganizationMemberDocView = UserDocView & { joined_at: Date }

export async function findOneByLogin(login: string) {
  const result = await getCollection<OrganizationDocument>('organizations')
    .findOne<OrganizationDocView>(
      { login },
      {
        projection: projectOrganizationDocView(),
      }
    )

  return result
}

export async function findOrganizationMembersByLogin(
  login: string,
  args: PaginationArguments
) {
  const { limit, sort, reference, operator } = paginationArgsToQueryArgs(args)

  const query: Document[] = [
    { $match: { login: login } },
    { $unwind: '$members' },
    { $replaceRoot: { newRoot: '$members' } },
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
        as: 'members',
      },
    },
    {
      $replaceWith: {
        $mergeObjects: [
          { $arrayElemAt: ['$members', 0] },
          { joined_at: '$created_at' },
        ],
      },
    },
    {
      $project: projectOrganizationMember(),
    },
  ]

  const result = await getCollection<OrganizationDocument>('organizations')
    .aggregate<OrganizationMemberDocView>(query)
    .toArray()

  return result
}

export async function findOrganizationMembersPageInfo<T>(
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
          { $unwind: '$members' },
          { $project: { created_at: '$members.created_at', _id: 0 } },
          { $sort: { created_at: 1 } },
          { $match: { created_at: { $lt: new Date(referencePrev) } } },
          { $limit: 1 },
        ],
        next: [
          { $match: { login: login } },
          { $unwind: '$members' },
          { $project: { created_at: '$members.created_at', _id: 0 } },
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

  const result = await getCollection<OrganizationDocument>('organizations')
    .aggregate<HasPage>(query)
    .toArray()

  return result.at(0)!
}
