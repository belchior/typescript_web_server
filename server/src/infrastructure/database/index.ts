import * as organization from './model/organization'
import * as repository from './model/repository'
import * as profileOwner from './model/profile'
import * as user from './model/user'
import * as conn from './db_connection'
import * as pagination from './util/pagination'

import type { FollowerDocView } from './model/profile'
import type { FollowingDocView, StarredRepository, UserDocument, UserDocView, UserOrganizationDocView } from './model/user'
import type { OrganizationDocument, OrganizationDocView, OrganizationMemberDocView } from './model/organization'
import type { RepositoryDocument } from './model/repository'
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
  FollowerDocView,
  FollowingDocView,
  OrganizationDocument,
  OrganizationMemberDocView,
  OrganizationDocView,
  RepositoryDocument,
  StarredRepository,
  TableNames,
  UserDocument,
  UserOrganizationDocView,
  UserDocView,
}
