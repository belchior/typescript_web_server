import { ProfileOwnerInterface } from './profile_type'
import { ProfileResolve } from './profile_resolve'
import { idType } from '../graphql/types'

export const ProfileQuery = {
  type: ProfileOwnerInterface,
  args: { login: idType() },
  resolve: ProfileResolve.profile,
}