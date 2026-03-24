import { TOrganization } from '../model/organization'
import { TRepository } from '../model/repository'
import { TUser } from '../model/user'

export type TTableNames =
  | 'organizations_members'
  | 'organizations'
  | 'repositories_licenses'
  | 'repositories_stars'
  | 'repositories'
  | 'users_following'
  | 'users'

export type ProfileOwnerType = 'User' | 'Organization'
export type TProfileOwner = {
  __typename: ProfileOwnerType
  avatar_url: TUser['avatar_url'] | TOrganization['avatar_url']
  location?: TUser['location'] | TOrganization['location']
  login: TUser['login'] | TOrganization['login']
  name?: TUser['name'] | TOrganization['name']
  url: TUser['url'] | TOrganization['url']
}

export type TRepositoryOwner = TProfileOwner

export type TModel =
  | TUser
  | TOrganization
  | TRepository
  | TProfileOwner