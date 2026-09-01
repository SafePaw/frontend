import { useState } from 'react'
import { isAxiosError } from 'axios'
import { updateMe } from '../../api/me'
import type { MeResponse } from '../../types/me'

interface Props {
  me: MeResponse
  onUpdated: (updated: MeResponse) => void
}

export default function AccountInfoSection({ me, onUpdated }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [nicknameInput, setNicknameInput] = useState(me.nickname)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const trimmed = nicknameInput.trim()
  const isValid = trimmed.length >= 2 && trimmed.length <= 20
  const isChanged = trimmed !== me.nickname

  async function handleSave() {
    if (!isValid || !isChanged || isSaving) return
    setSaveError(null)
    setIsSaving(true)
    try {
      const updated = await updateMe({ nickname: trimmed })
      onUpdated({ ...updated, nickname: trimmed })
      setNicknameInput(trimmed)
      setIsEditing(false)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setSaveError('이미 사용 중인 닉네임이에요.')
      } else {
        setSaveError('닉네임 저장에 실패했어요.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancel() {
    setIsEditing(false)
    setSaveError(null)
    setNicknameInput(me.nickname)
  }

  return (
    <div className="bg-navy-8 rounded-xl px-5 py-5 space-y-3 border border-navy-15 shadow-sm">
      <p className="text-f12 font-medium text-navy-70">계정 정보</p>
      {isEditing ? (
        <div className="space-y-2">
          <input
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder="닉네임"
            maxLength={20}
            className="w-full rounded-md px-4 py-3 bg-cream text-f16 text-navy outline-none focus:ring-2 focus:ring-navy-15"
            autoFocus
          />
          <p className={`text-f12 ${trimmed.length < 2 ? 'text-err' : 'text-navy-70'}`}>
            {trimmed.length < 2 ? '최소 2자 이상 입력해주세요' : `${trimmed.length}/20`}
          </p>
          {saveError && <p className="text-f12 text-err">{saveError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !isValid || !isChanged}
              className="flex-1 py-2 rounded-md bg-navy text-cream text-f12 font-medium disabled:opacity-40"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-2 rounded-md bg-navy-8 text-navy text-f12 font-medium"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-f12 text-navy-70">안녕하세요,</p>
            <p className="text-f20 font-semibold text-navy">{me.nickname}님</p>
            {me.email && <p className="text-f12 text-navy-70 mt-0.5">{me.email}</p>}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-f12 text-navy-70 border border-navy-15 rounded-pill px-3 py-1 flex-shrink-0 mt-1"
          >
            수정
          </button>
        </div>
      )}
    </div>
  )
}
