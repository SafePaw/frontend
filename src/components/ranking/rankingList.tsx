import RankingItem from './rankingItem'
import type { RankingItem as RankingItemType } from '../../types/ranking'

interface RankingListProps {
  items: RankingItemType[]
  myDogId: number | null
}

export default function RankingList({ items, myDogId }: RankingListProps) {
  return (
    <div>
      {items.map((item) => (
        <RankingItem key={item.dogId} item={item} isMe={item.dogId === myDogId} />
      ))}
    </div>
  )
}
