import { graphql } from 'react-relay'

export const fragment = {
  followers: graphql`
    fragment OrganizationFollowers on Organization
      @refetchable(queryName: "OrganizationFollowers_followers_query")
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 2 }
        cursor: { type: "String" }
      )
      {
      followers(first: $count after: $cursor) 
      @connection(key: "OrganizationFollowers_followers") {
        edges {
          node {
            avatarUrl
            bio
            company
            id
            location
            login
            name
            url
          }
        }
      }
    }
  `,
}

