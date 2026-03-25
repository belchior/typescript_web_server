import Dataloader from 'dataloader'

import database, { TOrganization, TRepositoryOwner, TUser } from '../../database'

export const createLoaders = () => ({
  findOrganizationByLogin: new Dataloader<string, TOrganization>(database.organization.findOrganizationsByLogins),
  findRepositoryOwner: new Dataloader<string, TRepositoryOwner>(database.repository.findRepositoryOwners),
  findUserByLogin: new Dataloader<string, TUser>(database.user.findUsersByLogins),
})

export type TLoaders = ReturnType<typeof createLoaders>