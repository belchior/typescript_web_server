import { useParams } from 'react-router'
import { useQueryString } from '../../util/hooks'
import type { ProfileTypeName } from '../../util/types'

export const organizationTabs = ['overview', 'repositories', 'people'] as const
export const userTabs = ['overview', 'repositories', 'stars', 'followers', 'following'] as const
export const tabs = [...userTabs, ...organizationTabs] as const

export type TOrganizationTabs = typeof organizationTabs[number]
export type TUserTabs = typeof userTabs[number]
export type TTabs = TOrganizationTabs | TUserTabs

export function useCurrentTab<T extends TTabs>() {
  const [search] = useQueryString()
  const tabIndex = Math.max(0, tabs.indexOf(search.get('tab') as TTabs))
  return tabs[tabIndex] as T
}

type MenuItem = {
  href: string,
  label: string,
}
type TabMap<T extends TTabs> = Record<T, MenuItem>

export function useMenuItems(typeName?: ProfileTypeName) {
  const params = useParams()
  const login = params.login ?? ''

  const initialTabMap = {
    'overview': {
      href: `/${login}`,
      label: 'Overview',
    },
  }

  const userTabMap: TabMap<TUserTabs> = {
    'overview': {
      href: `/${login}`,
      label: 'Overview',
    },
    'repositories': {
      href: `/${login}?tab=repositories`,
      label: 'Repositories',
    },
    'stars': {
      href: `/${login}?tab=stars`,
      label: 'Stars',
    },
    'followers': {
      href: `/${login}?tab=followers`,
      label: 'Followers',
    },
    'following': {
      href: `/${login}?tab=following`,
      label: 'Following',
    },
  }

  const organizationTabMap: TabMap<TOrganizationTabs> = {
    'overview': {
      href: `/${login}`,
      label: 'Overview',
    },
    'repositories': {
      href: `/${login}?tab=repositories`,
      label: 'Repositories',
    },
    'people': {
      href: `/${login}?tab=people`,
      label: 'People',
    },
  }

  switch (typeName) {
    case 'User': return userTabMap
    case 'Organization': return organizationTabMap
    default: return initialTabMap
  }
}
