import { ProfileOwnerInterface } from './type'
import { ProfileResolve } from './resolve'
import { idType } from '../graphql/types'

export const ProfileQuery = {
  type: ProfileOwnerInterface,
  args: { login: idType() },
  resolve: ProfileResolve.profile,
}