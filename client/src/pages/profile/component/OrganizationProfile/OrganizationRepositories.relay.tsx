import { graphql } from 'react-relay'

export const fragment = {
  repositories: graphql`
    fragment OrganizationRepositories on Organization
      @refetchable(queryName: "OrganizationRepositories_repositories_query")
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 2 }
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

