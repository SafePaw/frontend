import { useState, useEffect, useCallback } from 'react'
import {
  getMyCrew,
  getCrewMembers,
  leaveCrew,
  disbandCrew,
  kickMember,
  transferLeader,
  rotateInviteCode as apiRotateInviteCode,
} from '../api/crews'
import { extractErrorCode } from '../utils/apiError'
import type { CrewResponse, CrewMember } from '../types/crew'

const CREW_ERROR_MESSAGES: Record<string, string> = {
  CREW_LEADER_CANNOT_LEAVE: '리더는 위임하거나 해산한 뒤에 나갈 수 있습니다.',
  CREW_NOT_LEADER: '크루 리더만 할 수 있습니다.',
  CREW_TRANSFER_NOT_MEMBER: '위임 대상이 크루 멤버가 아닙니다.',
  CREW_NOT_MEMBER: '해당 크루의 멤버가 아닙니다.',
}

type PageState = 'loading' | 'notJoined' | 'joined' | 'error'

export function useCrewManagement() {
  const [pageState, setPageState] = useState<PageState>('loading')
  const [crew, setCrew] = useState<CrewResponse | null>(null)
  const [members, setMembers] = useState<CrewMember[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isMutating, setIsMutating] = useState(false)
  const [mutateError, setMutateError] = useState<string | null>(null)
  const [inlineMessage, setInlineMessage] = useState<string | null>(null)

  const loadCrew = useCallback(async () => {
    setFetchError(null)
    try {
      const crewData = await getMyCrew()
      setCrew(crewData)
      const memberData = await getCrewMembers(crewData.id)
      setMembers(memberData)
      setPageState('joined')
    } catch (err) {
      const code = extractErrorCode(err)
      if (code === 'CREW_NOT_JOINED') {
        setCrew(null)
        setMembers([])
        setPageState('notJoined')
      } else {
        setFetchError('크루 정보를 불러오지 못했어요.')
        setPageState('error')
      }
    }
  }, [])

  useEffect(() => {
    loadCrew()
  }, [loadCrew])

  async function refreshCrew() {
    if (!crew) return
    try {
      const crewData = await getMyCrew()
      setCrew(crewData)
      const memberData = await getCrewMembers(crewData.id)
      setMembers(memberData)
    } catch {
      // 갱신 실패는 조용히 무시 (기존 데이터 유지)
    }
  }

  function applyNewCrew(newCrew: CrewResponse) {
    setCrew(newCrew)
    getCrewMembers(newCrew.id)
      .then(setMembers)
      .catch(() => setMembers([]))
    setPageState('joined')
  }

  function applyEditedCrew(updatedCrew: CrewResponse) {
    setCrew(updatedCrew)
  }

  async function rotateInviteCode() {
    if (!crew || isMutating) return
    setIsMutating(true)
    setMutateError(null)
    try {
      const updated = await apiRotateInviteCode(crew.id)
      setCrew(updated)
      setInlineMessage('초대 코드가 재발급됐어요.')
      setTimeout(() => setInlineMessage(null), 2500)
    } catch (err) {
      const code = extractErrorCode(err)
      setMutateError(CREW_ERROR_MESSAGES[code] ?? '초대 코드 재발급에 실패했습니다.')
    } finally {
      setIsMutating(false)
    }
  }

  async function leave() {
    if (!crew || isMutating) return
    setIsMutating(true)
    setMutateError(null)
    try {
      await leaveCrew(crew.id)
      setCrew(null)
      setMembers([])
      setPageState('notJoined')
    } catch (err) {
      const code = extractErrorCode(err)
      setMutateError(CREW_ERROR_MESSAGES[code] ?? '요청에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsMutating(false)
    }
  }

  async function disband() {
    if (!crew || isMutating) return
    setIsMutating(true)
    setMutateError(null)
    try {
      await disbandCrew(crew.id)
      setCrew(null)
      setMembers([])
      setPageState('notJoined')
    } catch (err) {
      const code = extractErrorCode(err)
      setMutateError(CREW_ERROR_MESSAGES[code] ?? '요청에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsMutating(false)
    }
  }

  async function kick(member: CrewMember) {
    if (!crew || isMutating) return
    setIsMutating(true)
    setMutateError(null)
    try {
      await kickMember(crew.id, member.userId)
      await refreshCrew()
    } catch (err) {
      const code = extractErrorCode(err)
      setMutateError(CREW_ERROR_MESSAGES[code] ?? '요청에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsMutating(false)
    }
  }

  async function transfer(member: CrewMember) {
    if (!crew || isMutating) return
    setIsMutating(true)
    setMutateError(null)
    try {
      await transferLeader(crew.id, { targetUserId: member.userId })
      await refreshCrew()
    } catch (err) {
      const code = extractErrorCode(err)
      setMutateError(CREW_ERROR_MESSAGES[code] ?? '요청에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsMutating(false)
    }
  }

  return {
    crew,
    members,
    pageState,
    fetchError,
    mutateError,
    isMutating,
    inlineMessage,
    loadCrew,
    applyNewCrew,
    applyEditedCrew,
    rotateInviteCode,
    leave,
    disband,
    kick,
    transfer,
  }
}
