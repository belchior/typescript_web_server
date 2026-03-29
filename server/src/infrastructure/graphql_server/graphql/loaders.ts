import Dataloader from 'dataloader'

import database, { Organization, RepositoryOwner, User } from '../../database'
import { OwnerIdentity } from '../../database/model/profileOwner'

export const createLoaders = () => ({
  findOrganizationByLogin: new Dataloader<string, Organization>(
    database.organization.findOrganizationsByLogins
  ),
  findRepositoryOwner: new Dataloader<string, RepositoryOwner>(
    database.repository.findRepositoryOwners
  ),
  findOwnersIdentityById: new Dataloader<string, OwnerIdentity>(
    database.profileOwner.findOwnerIdentitiesByIds
  ),
  findUserByLogin: new Dataloader<string, User>(database.user.findUsersByLogins),
})

export type Loaders = ReturnType<typeof createLoaders>