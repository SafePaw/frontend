import type { RefCallback } from 'react'
import RankingItem from './rankingItem'
import type { RankingItem as RankingItemType } from '../../types/ranking'

interface RankingListProps {
  items: RankingItemType[]
  myDogId: number | null
  myRowRef?: RefCallback<HTMLDivElement>
}

export default function RankingList({ items, myDogId, myRowRef }: RankingListProps) {
  return (
    <div>
      {items.map((item) => (
        <RankingItem
          key={item.dogId}
          item={item}
          isMe={item.dogId === myDogId}
          innerRef={item.dogId === myDogId ? myRowRef : undefined}
        />
      ))}
    </div>
  )
}
