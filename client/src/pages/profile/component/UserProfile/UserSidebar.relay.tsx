import { graphql } from 'react-relay'

export const fragment = {
  profile: graphql`
    fragment UserSidebar on User
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 5 }
        cursor: { type: "String" }
      ) {
      avatarUrl
      bio
      company
      email
      location
      login
      name
      websiteUrl
      organizations(first: $count after: $cursor)
        @connection(key: "UserSidebar_organizations") {
        edges {
          node {
            avatarUrl
            id
            login
            name
            url
          }
        }
      }
    }
  `,
}

