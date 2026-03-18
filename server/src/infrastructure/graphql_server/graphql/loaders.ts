import Dataloader from 'dataloader'

import { findOrganizationsByLogins, TOrganization } from '../../database/model/organization'
import { findUsersByLogins, TUser } from '../../database/model/user'
import { findRepositoryOwners } from '../../database/model/repository'
import { TRepositoryOwner } from '../../database/util/types'

export const createLoaders = () => ({
  findOrganizationByLogin: new Dataloader<string, TOrganization>(findOrganizationsByLogins),
  findRepositoryOwner: new Dataloader<string, TRepositoryOwner>(findRepositoryOwners),
  findUserByLogin: new Dataloader<string, TUser>(findUsersByLogins),
})

export type TLoaders = ReturnType<typeof createLoaders>