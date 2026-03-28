import List, { type ListPagination } from '../../../../designSystem/List/List'
import RepositoryItem from './RepositoryItem'
import type { UserRepositories_repositories$data } from '../UserProfile/__generated__/UserRepositories_repositories.graphql'

type RepositoriesListProps = {
  items: UserRepositories_repositories$data['repositories']
  pagination: ListPagination
}

export default function RepositoriesList(props: RepositoriesListProps) {
  const repositories = props.items.edges.map(item => item?.node).filter(node => node != null)
  return (
    <List pagination={props.pagination}>
      {repositories.map(repo => <RepositoryItem key={repo.id} repository={repo} />)}
    </List>
  )
}

