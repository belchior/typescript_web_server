import {
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql'

import { idType, NodeInterface } from '../graphql/types'
import { ProfileResolve } from './resolve'
import { TOwner } from '../../database/util/types'
import { TUser } from '../../database/model/user'
import { TOrganization } from '../../database/model/organization'

export const ProfileOwnerInterface = new GraphQLInterfaceType({
  interfaces: [NodeInterface],
  name: 'ProfileOwner',
  fields: () => ({
    avatarUrl: { type: new GraphQLNonNull(GraphQLString) },
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (parent: TOwner) => {
        switch (parent.__typename) {
          case 'User': { return `users_${(parent as TUser).user_id}` }
          case 'Organization': { return `organizations_${(parent as TOrganization).organization_id}` }
          default: { throw new Error(`unknown typename: ${parent.__typename}`) }
        }
      },
    },
    login: idType(),
    name: { type: GraphQLString },
    url: { type: new GraphQLNonNull(GraphQLString) },
  }),
  resolveType: ProfileResolve.profileOwner,
})