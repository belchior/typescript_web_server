import type { Organization } from '../model/organization'
import type { ProfileOwner } from '../model/profileOwner'
import type { Repository } from '../model/repository'
import type { User } from '../model/user'

export type TableNames =
  | 'organizations_members'
  | 'organizations'
  | 'repositories_licenses'
  | 'repositories_stars'
  | 'repositories'
  | 'users_following'
  | 'users'

export type Model =
  | User
  | Organization
  | Repository
  | ProfileOwner