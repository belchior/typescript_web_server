import { UserResolve } from './user_resolve'
import { UserType } from './user_type'
import { idType } from '../graphql/types'

export const UserQuery = {
  type: UserType,
  args: { login: idType() },
  resolve: UserResolve.user,
}