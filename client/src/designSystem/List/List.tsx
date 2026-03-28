import { type PropsWithChildren } from 'react'

import Button from '../Button/Button'
import './List.css'

export type ListPagination = {
  loadNext: (_count: number) => void
  loadPrevious: (_count: number) => void
  hasNext: boolean
  hasPrevious: boolean
  isLoadingNext: boolean
  isLoadingPrevious: boolean
}
type ListProps = PropsWithChildren & {
  pagination: ListPagination
}

export default function List(props: ListProps) {
  const { children, pagination } = props

  if (Array.isArray(children) && children.length === 0) {
    return (
      <div className="List">
        <p className="empty">There is no item to show</p>
      </div>
    )
  }

  return (
    <div className="List">
      <ul>
        {children}
      </ul>
      <div className="action-container">
        {pagination.hasNext && (
          <Button onClick={() => pagination.loadNext(10)}>load more</Button>
        )}
      </div>
    </div>
  )
}

