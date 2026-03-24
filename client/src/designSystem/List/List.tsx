import React from 'react'

import Button from '../Button/Button'
import './List.css'

export type PaginationControl = {
  hasMore: boolean,
  isLoading: boolean,
  loadMore: (_count: number) => void,
}
type ListProps = {
  paginationCtrl: PaginationControl
  children: React.ReactNode
}

export default function List(props: ListProps) {
  const { paginationCtrl, children } = props

  const handleLoadMore = () => {
    if (paginationCtrl.hasMore === false || paginationCtrl.isLoading === true) return
    paginationCtrl.loadMore(10)
  }

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
        <Button onClick={handleLoadMore} disabled={paginationCtrl.hasMore === false}>
          {paginationCtrl.hasMore ? 'load more' : 'no more items to show'}
        </Button>
      </div>
    </div>
  )
}

