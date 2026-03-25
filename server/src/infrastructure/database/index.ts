import * as organization from './model/organization'
import * as repository from './model/repository'
import * as profileOwner from './model/profileOwner'
import * as user from './model/user'
import * as conn from './db_connection'
import * as pagination from './util/pagination'

import type { TOrganization, TOrganizationMember } from './model/organization'
import type { TRepository, TRepositoryOwner, TStarredRepository, TProfileOwnerIdentifier } from './model/repository'
import type { TProfileOwner, ProfileOwnerType, TFollowing } from './model/profileOwner'
import type { TUser, TUserOrganization, TFollower } from './model/user'
import type { DBConnection } from './db_connection'
import type { TTableNames } from './util/types'

export default {
  organization,
  repository,
  profileOwner,
  user,
  util: {
    ...pagination,
  },
  ...conn,
}

export type {
  DBConnection,
  ProfileOwnerType,
  TFollower,
  TFollowing,
  TOrganization,
  TOrganizationMember,
  TProfileOwner,
  TProfileOwnerIdentifier,
  TRepository,
  TRepositoryOwner,
  TStarredRepository,
  TTableNames,
  TUser,
  TUserOrganization,
}
