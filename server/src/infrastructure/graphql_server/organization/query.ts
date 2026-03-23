import { OrganizationType } from './type'
import { OrganizationResolve } from './resolve'
import { idType } from '../graphql/types'

export const OrganizationQuery = {
  type: OrganizationType,
  args: { login: idType() },
  resolve: OrganizationResolve.organization,
}