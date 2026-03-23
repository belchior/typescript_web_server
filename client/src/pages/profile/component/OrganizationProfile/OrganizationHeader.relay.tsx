import { graphql } from 'react-relay'

export const fragment = {
  profile: graphql`
    fragment OrganizationHeader on Organization {
      avatarUrl
      description
      location
      login
      name
      url
      websiteUrl
    }
  `,
}
