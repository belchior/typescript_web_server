import { TOrganization } from '../model/organization'
import { TProfileOwner } from '../model/profileOwner'
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

export type TModel =
  | TUser
  | TOrganization
  | TRepository
  | TProfileOwner