import { graphql } from 'react-relay'

export const fragment = {
  followers: graphql`
    fragment OrganizationFollowers on Organization
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 5 }
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

