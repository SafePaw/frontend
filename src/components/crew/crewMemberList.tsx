import type { CrewMember, CrewRole } from '../../types/crew'

interface Props {
  members: CrewMember[]
  myUserId: number
  myRole: CrewRole
  isMutating: boolean
  onKick: (member: CrewMember) => void
  onTransfer: (member: CrewMember) => void
}

export default function CrewMemberList({
  members,
  myUserId,
  myRole,
  isMutating,
  onKick,
  onTransfer,
}: Props) {
  const isLeader = myRole === 'LEADER'

  return (
    <div>
      <p className="text-f16 font-semibold text-navy mb-3">멤버 목록</p>
      <div className="space-y-2">
        {members.map((member) => {
          const isMe = member.userId === myUserId
          const isMemberLeader = member.role === 'LEADER'

          return (
            <div
              key={member.userId}
              className="bg-navy-5 rounded-xl px-4 py-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-navy-15 flex items-center justify-center flex-shrink-0">
                <span className="text-f12 text-navy-70 font-medium">
                  {member.nickname.charAt(0)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-f16 font-medium text-navy truncate">{member.nickname}</span>
                  {isMe && (
                    <span className="text-f10 text-navy-70 border border-navy-15 rounded-full px-2 py-0.5 flex-shrink-0">
                      나
                    </span>
                  )}
                  {isMemberLeader && (
                    <span className="text-f10 text-cream bg-navy rounded-full px-2 py-0.5 flex-shrink-0">
                      리더
                    </span>
                  )}
                </div>
                <p className="text-f12 text-navy-70 mt-0.5">강아지 {member.dogCount}마리</p>
              </div>

              {isLeader && !isMe && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => onTransfer(member)}
                    disabled={isMutating}
                    className="text-f12 text-navy-70 border border-navy-15 rounded-pill px-3 py-1 disabled:opacity-40 active:opacity-70 transition-opacity"
                  >
                    위임
                  </button>
                  <button
                    onClick={() => onKick(member)}
                    disabled={isMutating}
                    className="text-f12 text-err border border-err/30 rounded-pill px-3 py-1 disabled:opacity-40 active:opacity-70 transition-opacity"
                  >
                    강퇴
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
