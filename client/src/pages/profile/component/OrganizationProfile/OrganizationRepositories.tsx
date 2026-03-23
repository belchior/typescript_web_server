import { useFragment } from 'react-relay'

import { fragment } from './OrganizationRepositories.relay'
import RepositoriesList from '../RepositoriesList/RepositoriesList'
import Title from '../../../../designSystem/Title/Title'
import type { OrganizationRepositories$key } from './__generated__/OrganizationRepositories.graphql'

type OrganizationRepositoriesProps = {
  profile: OrganizationRepositories$key
}
export function OrganizationRepositories(props: OrganizationRepositoriesProps) {
  const organization = useFragment(fragment.repositories, props.profile)

  return <div className="OrganizationRepositories">
    <Title variant="h2">Repositories</Title>
    <RepositoriesList
      repositories={organization.repositories}
      paginationCtrl={{
        hasMore: false,
        isLoading: false,
        loadMore: () => { },
      }}
    />
  </div>
}
