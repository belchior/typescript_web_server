import Dataloader from 'dataloader'

import database, { Organization, RepositoryOwner, User } from '../../database'

export const createLoaders = () => ({
  findOrganizationByLogin: new Dataloader<string, Organization>(database.organization.findOrganizationsByLogins),
  findRepositoryOwner: new Dataloader<string, RepositoryOwner>(database.repository.findRepositoryOwners),
  findUserByLogin: new Dataloader<string, User>(database.user.findUsersByLogins),
})

export type Loaders = ReturnType<typeof createLoaders>