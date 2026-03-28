import { usePaginationFragment } from 'react-relay'

import { fragment } from './OrganizationRepositories.relay'
import RepositoriesList from '../RepositoriesList/RepositoriesList'
import Title from '../../../../designSystem/Title/Title'
import type { OrganizationRepositories$key } from './__generated__/OrganizationRepositories.graphql'

type OrganizationRepositoriesProps = {
  profile: OrganizationRepositories$key
}
export function OrganizationRepositories(props: OrganizationRepositoriesProps) {
  const {
    data: organization,
    ...pagination
  } = usePaginationFragment(fragment.repositories, props.profile)

  return <div className="OrganizationRepositories">
    <Title variant="h2">Repositories</Title>
    <RepositoriesList items={organization.repositories} pagination={pagination} />
  </div>
}
