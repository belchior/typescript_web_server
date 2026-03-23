import { UserResolve } from './resolve'
import { UserType } from './type'
import { idType } from '../graphql/types'

export const UserQuery = {
  type: UserType,
  args: { login: idType() },
  resolve: UserResolve.user,
}