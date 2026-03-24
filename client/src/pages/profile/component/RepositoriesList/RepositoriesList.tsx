import List, { type PaginationControl } from '../../../../designSystem/List/List'
import RepositoryItem from './RepositoryItem'
import type { UserRepositories_repositories$data } from '../UserProfile/__generated__/UserRepositories_repositories.graphql'

type RepositoriesListProps = {
  repositories: UserRepositories_repositories$data['repositories']
  paginationCtrl: PaginationControl
}

export default function RepositoriesList(props: RepositoriesListProps) {
  const repositories = props.repositories.edges.map(item => item?.node).filter(node => node != null)
  return (
    <List paginationCtrl={props.paginationCtrl}>
      {repositories.map(repo => <RepositoryItem key={repo.id} repository={repo} />)}
    </List>
  )
}

