
import { ObjectId } from 'mongodb'

import database, { OrganizationDocument, RepositoryDocument, UserDocument } from '../../src/infrastructure/database'
import { delay } from './delay'
import { randomInteger } from './random'

export async function insertOrganization(suffix: string, doc: Partial<OrganizationDocument>) {
  const data: OrganizationDocument = {
    _id: new ObjectId(),
    avatar_url: 'https://mysite.com/avatar.png',
    created_at: new Date(),
    description: `Description ${suffix}`,
    followers: [],
    location: 'World',
    login: `org_${suffix}`,
    name: `name_${suffix}`,
    members: [],
    repositories: [],
    url: `https://github.com/owner_${suffix}/name_${suffix}`,
    email: 'email@mysite.com',
    website_url: 'https://mysite.com',
    ...doc,
  }

  const coll = database.getCollection<OrganizationDocument>('organizations')
  const insertResult = await coll.insertOne(data)
  const result = await coll.findOne({ _id: insertResult.insertedId })

  return result as OrganizationDocument
}

type InsertOrganizationsMembersArgs = {
  organization_login: OrganizationDocument['login'],
  user_login: UserDocument['login'],
  created_at?: Date,
}
async function insertOrganizationMember(args: InsertOrganizationsMembersArgs) {
  const { organization_login, user_login } = args

  const createdAt = new Date()
  const orgColl = database.getCollection<OrganizationDocument>('organizations')
  const userColl = database.getCollection<UserDocument>('users')

  await orgColl.updateOne(
    { login: organization_login },
    {
      // @ts-expect-error TODO
      $push: {
        members: {
          login: user_login,
          ref: 'users',
          created_at: createdAt,
        },
      },
    }
  )

  await userColl.updateOne(
    { login: user_login },
    {
      // @ts-expect-error TODO
      $push: {
        organizations: {
          login: organization_login,
          ref: 'organizations',
          created_at: createdAt,
        },
      },
    }
  )

  args.created_at = createdAt

  return args
}

export async function insertOrganizationsMembers(list: InsertOrganizationsMembersArgs[]) {
  const results = []

  for (const data of list) {
    // needed to bind user to an org in a consistent order
    await delay(randomInteger(1, 10))
    const result = await insertOrganizationMember(data)
    results.push(result)
  }

  return results
}

export async function insertRepository(suffix: string, doc: Partial<RepositoryDocument>) {
  const data: RepositoryDocument = {
    _id: new ObjectId(),
    created_at: new Date(),
    description: `Description ${suffix}`,
    fork_count: randomInteger(1, 10000),
    license_info: {
      name: 'MIT',
    },
    name: `repo_${suffix}`,
    owner: {
      _id: new ObjectId(),
      login: `owner_${suffix}`,
      ref: 'users',
    },
    primary_language: {
      color: '#2b7489',
      name: 'TypeScript',
    },
    star_count: randomInteger(1, 10000),
    url: `http://github.com/owner_${suffix}/name_${suffix}`,
    ...doc,
  }

  const coll = database.getCollection<RepositoryDocument>('repositories')
  const insertResult = await coll.insertOne(data)
  const result = await coll.findOne({ _id: insertResult.insertedId })

  return result as RepositoryDocument
}

export async function insertRepositories(suffix: string, repos: Partial<RepositoryDocument>[]) {
  const results = []

  for (const data of repos) {
    // needed to create repositories in a consistent order
    await delay(randomInteger(1, 10))
    const repo = await insertRepository(suffix, data)
    results.push(repo)
  }

  return results
}

type InsertUsersStarredRepositoriesArgs = {
  user_login: UserDocument['login'],
  repository_id: RepositoryDocument['_id'],
  created_at?: Date,
}
async function insertStarredRepository(args: InsertUsersStarredRepositoriesArgs) {
  const { user_login, repository_id } = args
  const createdAt = new Date()

  await database.getCollection<UserDocument>('users').updateOne(
    { login: user_login },
    {
      // @ts-expect-error TODO
      $push: {
        starred_repositories: {
          _id: repository_id,
          ref: 'repositories',
          created_at: createdAt,
        },
      },
    }
  )

  args.created_at = createdAt

  return args
}

export async function insertUsersStarredRepositories(list: InsertUsersStarredRepositoriesArgs[]) {
  const results = []

  for (const args of list) {
    // needed to bind star a repositories in a consistent order
    await delay(randomInteger(1, 10))
    const result = await insertStarredRepository(args)
    results.push(result)
  }

  return results
}

export async function insertUser(suffix: string, doc: Partial<UserDocument>) {
  const data: UserDocument = {
    _id: new ObjectId(),
    avatar_url: 'https://mysite.com/avatar.png',
    bio: `bio ${suffix}`,
    company: `company ${suffix}`,
    created_at: new Date(),
    email: `email@${suffix}`,
    followers: [],
    following: [],
    location: 'World',
    login: `user_${suffix}`,
    name: `name_${suffix}`,
    organizations: [],
    repositories: [],
    starred_repositories: [],
    url: `https://github.com/owner_${suffix}/name_${suffix}`,
    website_url: 'https://mysite.com',
    ...doc,
  }

  const coll = database.getCollection<UserDocument>('users')
  const insertResult = await coll.insertOne(data)
  const result = await coll.findOne({ _id: insertResult.insertedId })

  return result as UserDocument
}

type InsertFollowingArgs = {
  user_login: UserDocument['login'],
  following_login: UserDocument['login'] | OrganizationDocument['login'],
  following_ref: 'users' | 'organizations'
  created_at?: Date,
}
async function insertFollowing(args: InsertFollowingArgs) {
  const { user_login, following_login, following_ref } = args
  const createdAt = new Date()

  await database.getCollection<UserDocument>('users').updateOne(
    { login: user_login },
    {
      // @ts-expect-error TODO
      $push: {
        following: {
          login: following_login,
          ref: following_ref,
          created_at: createdAt,
        },
      },
    }
  )

  await database.getCollection(following_ref).updateOne(
    { login: following_login },
    {
      // @ts-expect-error TODO
      $push: {
        followers: {
          login: user_login,
          ref: 'users',
          created_at: createdAt,
        },
      },
    }
  )

  args.created_at = createdAt

  return args
}

export async function insertUsersFollowing(list: InsertFollowingArgs[]) {
  const results = []

  for (const args of list) {
    // needed to bind following user in a consistent order
    await delay(randomInteger(1, 10))
    const result = await insertFollowing(args)
    results.push(result)
  }

  return results
}
