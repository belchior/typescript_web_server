import { cls } from '../../util/classNames'
import { useMenuItems, useCurrentTab } from './PageMenu.hooks'
import Anchor from '../Anchor/Anchor'
import Container from '../Container/Container'
import type { ProfileTypeName } from '../../util/types'
import './PageMenu.css'

type AppMenuProps = {
  className?: string
  profileTypeName?: ProfileTypeName
}

export default function AppMenu(props: AppMenuProps) {
  const { className, profileTypeName } = props

  const activeTab = useCurrentTab()
  const menuItems = useMenuItems(profileTypeName)
  const classes = cls('AppMenu', className)

  return (
    <Container className={classes}>
      <ul>
        {Object.entries(menuItems).map(([key, value]) => (
          <li key={key} className={cls([activeTab === key, 'active'])}>
            <Anchor className="menuItem" decoration="button" href={value.href}>
              {value.icon}
              {value.label}
            </Anchor>
          </li>
        ))}
      </ul>
    </Container>
  )
}
