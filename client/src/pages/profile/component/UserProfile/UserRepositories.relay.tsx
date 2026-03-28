import { graphql } from 'react-relay'

export const fragment = {
  repositories: graphql`
    fragment UserRepositories_repositories on User
      @refetchable(queryName: "UserRepositories_repositories_query")
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 2 }
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
            starCount
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
      @refetchable(queryName: "UserRepositories_starredRepositories_query")
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 2 }
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
            starCount
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

