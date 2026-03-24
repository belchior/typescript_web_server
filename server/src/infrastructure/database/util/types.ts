import { TOrganization } from '../model/organization'
import { TRepository } from '../model/repository'
import { TUser } from '../model/user'

export type TModel =
  | TUser
  | TOrganization
  | TRepository

export type TTableNames =
  | 'users'
  | 'users_following'
  | 'users_organizations'
  | 'repositories_stars'
  | 'organizations'
  | 'repositories'
  | 'repositories_licenses'

export type TOwner = {
  __typename: TUser['__typename'] | TOrganization['__typename']
  avatar_url: string
  login: string
  url: string
}

export type TRepositoryOwner = TOwner
