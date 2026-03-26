import * as organization from './model/organization'
import * as repository from './model/repository'
import * as profileOwner from './model/profileOwner'
import * as user from './model/user'
import * as conn from './db_connection'
import * as pagination from './util/pagination'

import type { Organization, OrganizationMember } from './model/organization'
import type { Repository, RepositoryOwner, StarredRepository, ProfileOwnerIdentifier } from './model/repository'
import type { ProfileOwner, Following } from './model/profileOwner'
import type { User, UserOrganization, Follower } from './model/user'
import type { DBConnection } from './db_connection'
import type { TableNames } from './util/types'

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
  Follower,
  Following,
  Organization,
  OrganizationMember,
  ProfileOwner,
  ProfileOwnerIdentifier,
  Repository,
  RepositoryOwner,
  StarredRepository,
  TableNames,
  User,
  UserOrganization,
}
