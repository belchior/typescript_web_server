import Anchor from '../../../../designSystem/Anchor/Anchor'
import IconFork from '../../../../designSystem/Icon/Fork'
import IconLicense from '../../../../designSystem/Icon/License'
import Language from '../Language/Language'
import Title from '../../../../designSystem/Title/Title'
import type { NonNullable } from '../../../../util/types'
import type { UserRepositories_repositories$data } from '../UserProfile/__generated__/UserRepositories_repositories.graphql'
import './RepositoryItem.css'

type Edge = NonNullable<UserRepositories_repositories$data['repositories']['edges'][number]>
type Repository = NonNullable<Edge['node']>

type RepositoryItemProps = {
  repository: Repository
}

export default function RepositoryItem(props: RepositoryItemProps) {
  const { repository } = props
  const language = repository.primaryLanguage

  return (
    <li className="RepositoryItem" data-testid="repository-item">
      <Anchor href={repository.url}>
        <Title className="name" variant="h3">{repository.name}</Title>
      </Anchor>

      {repository.description &&
        <p className="description">{repository.description}</p>
      }
      <div className="details">
        {language && <Language color={language.color}>{language.name}</Language>}
        {(repository.forkCount ?? 0) > 0 &&
          <p>
            <IconFork />
            {repository.forkCount}
          </p>
        }
        {repository.licenseInfo &&
          <span>
            <IconLicense />
            {repository.licenseInfo.name}
          </span>
        }
      </div>
    </li>
  )
}
