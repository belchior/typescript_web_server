import { graphql } from 'react-relay'

export const fragment = {
  people: graphql`
    fragment OrganizationPeople on Organization
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 5 }
        cursor: { type: "String" }
      )
      {
      people(first: $count after: $cursor) 
      @connection(key: "OrganizationPeople_people") {
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

