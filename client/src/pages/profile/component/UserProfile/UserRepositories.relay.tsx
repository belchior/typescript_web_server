import { graphql } from 'react-relay'

export const fragment = {
  repositories: graphql`
    fragment UserRepositories_repositories on User
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 5 }
        cursor: { type: "String" }
      )
      {
      repositories(first: $count after: $cursor) 
      @connection(key: "UserRepositories_repositories") {
        edges {
          node {
            id
            name
            description
            forkCount
            licenseInfo {
              name
            }
            primaryLanguage {
              color
              name
            }
            url
          }
        }
      }
    }
  `,
  stars: graphql`
    fragment UserRepositories_stars on User
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 5 }
        cursor: { type: "String" }
      )
      {
      starredRepositories(first: $count after: $cursor) 
      @connection(key: "UserRepositories_starredRepositories") {
        edges {
          node {
            id
            name
            description
            forkCount
            licenseInfo {
              name
            }
            primaryLanguage {
              color
              name
            }
            url
          }
        }
      }
    }
  `,
}

