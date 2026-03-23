import { useFragment } from 'react-relay'

import { fragment } from './UserRepositories.relay'
import RepositoriesList from '../RepositoriesList/RepositoriesList'
import Title from '../../../../designSystem/Title/Title'
import type { UserRepositories_repositories$key } from './__generated__/UserRepositories_repositories.graphql'
import type { UserRepositories_stars$key } from './__generated__/UserRepositories_stars.graphql'

type UserRepositoriesProps = {
  profile: UserRepositories_repositories$key
}
export function UserRepositories(props: UserRepositoriesProps) {
  const user = useFragment(fragment.repositories, props.profile)

  return <div>
    <Title variant="h2">Repositories</Title>
    <RepositoriesList
      repositories={user.repositories}
      paginationCtrl={{
        hasMore: false,
        isLoading: false,
        loadMore: () => { },
      }}
    />
  </div>
}

type UserStarredRepositoriesProps = {
  profile: UserRepositories_stars$key
}
export function UserStarredRepositories(props: UserStarredRepositoriesProps) {
  const user = useFragment(fragment.stars, props.profile)

  return <div>
    <Title variant="h2">Stars</Title>
    <RepositoriesList
      repositories={user.starredRepositories}
      paginationCtrl={{
        hasMore: false,
        isLoading: false,
        loadMore: () => { },
      }}
    />
  </div>
}
