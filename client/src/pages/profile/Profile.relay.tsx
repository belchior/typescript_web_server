import { graphql } from 'react-relay'

export const query = graphql`
  query ProfileQuery(
    $cursor: String
    $followers: Boolean!
    $following: Boolean!
    $login: ID!
    $people: Boolean!
    $repositories: Boolean!
    $stars: Boolean!
  ) {
    profile(login: $login) {
      id
      __typename

      ... on User {
        ...UserSidebar
        ...UserRepositories_repositories @arguments(cursor: $cursor) @include(if: $repositories)
        ...UserRepositories_stars @arguments(cursor: $cursor) @include(if: $stars)
        ...UserFollowing_followers @arguments(cursor: $cursor) @include(if: $followers)
        ...UserFollowing_following @arguments(cursor: $cursor) @include(if: $following)
      }

      ... on Organization {
        ...OrganizationHeader
        ...OrganizationRepositories @arguments(cursor: $cursor) @include(if: $repositories)
        ...OrganizationPeople @arguments(cursor: $cursor) @include(if: $people)
      }
    }
  }
`
