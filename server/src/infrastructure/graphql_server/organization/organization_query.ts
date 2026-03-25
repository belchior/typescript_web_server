import { OrganizationType } from './organization_type'
import { OrganizationResolve } from './organization_resolve'
import { idType } from '../graphql/types'

export const OrganizationQuery = {
  type: OrganizationType,
  args: { login: idType() },
  resolve: OrganizationResolve.organization,
}