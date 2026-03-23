import { graphql } from 'react-relay'

export const fragment = {
  repositories: graphql`
    fragment OrganizationRepositories on Organization
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 5 }
        cursor: { type: "String" }
      )
      {
      repositories(first: $count after: $cursor) 
      @connection(key: "OrganizationRepositories_repositories") {
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

