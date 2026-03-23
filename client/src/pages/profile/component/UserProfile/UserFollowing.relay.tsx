import { graphql } from 'react-relay'

export const fragment = {
  following: graphql`
    fragment UserFollowing_following on User
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 5 }
        cursor: { type: "String" }
      )
      {
      following(first: $count after: $cursor) 
      @connection(key: "UserFollowing_following") {
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
  followers: graphql`
    fragment UserFollowing_followers on User
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 5 }
        cursor: { type: "String" }
      )
      {
      followers(first: $count after: $cursor) 
      @connection(key: "UserFollowing_followers") {
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

