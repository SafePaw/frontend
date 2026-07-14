import { useState, useEffect } from 'react'
import { isAxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { getMeFull, updateMe } from '../../api/me'
import { getDogs } from '../../api/dogs'
import { useAuthStore } from '../../stores/authStore'
import { resolveMarkerImage, DEFAULT_MARKER_IMAGE_SRC } from '../../utils/markerImage'
import Button from '../../components/ui/button'
import type { MeResponse, MeDogSummary } from '../../types/me'
import type { Dog, DogRank } from '../../types/dog'

const APP_VERSION = '0.0.1'

const RANK_LABELS: Record<DogRank, string> = {
  PUPPY_WALKER: '새내기 산책러',
  NEIGHBORHOOD_EXPLORER: '동네 탐험가',
  STREET_STROLLER: '동네 산책꾼',
  TERRITORY_PIONEER: '영역 개척가',
  ALPHA_DOG: '알파 독',
}

function formatRank(rank: DogRank): string {
  return RANK_LABELS[rank]
}

function formatGender(gender: string): string {
  if (gender === 'MALE') return '수컷'
  if (gender === 'FEMALE') return '암컷'
  return '성별 미등록'
}

function DogAvatarImg({ dog, detail }: { dog: MeDogSummary; detail?: Dog }) {
  const [imgError, setImgError] = useState(false)

  return (
    <img
      src={
        imgError
          ? DEFAULT_MARKER_IMAGE_SRC
          : resolveMarkerImage({
              markerImageType: detail?.markerImageType ?? dog.markerImageType,
              markerImageValue: detail?.markerImageValue ?? dog.markerImageValue,
              markerImageUrl: detail?.markerImageUrl ?? dog.markerImageUrl,
            })
      }
      alt={dog.name || '강아지'}
      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
      onError={() => setImgError(true)}
    />
  )
}

export default function MyPage() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const [me, setMe] = useState<MeResponse | null>(null)
  const [dogDetailMap, setDogDetailMap] = useState<Map<number, Dog>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [comingSoonMessage, setComingSoonMessage] = useState<string | null>(null)

  const trimmedNickname = nicknameInput.trim()
  const isNicknameValid = trimmedNickname.length >= 2

  useEffect(() => {
    Promise.all([getMeFull(), getDogs()])
      .then(([meData, dogs]) => {
        setMe(meData)
        setNicknameInput(meData.nickname)
        setDogDetailMap(new Map(dogs.map((d) => [d.id, d])))
      })
      .catch(() => setError('사용자 정보를 불러오지 못했어요.'))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleSaveNickname() {
    if (!me || !isNicknameValid || isSaving) return
    const nicknameSent = nicknameInput.trim()
    setSaveError(null)
    setIsSaving(true)
    try {
      const updated = await updateMe({ nickname: nicknameSent })
      setMe({ ...updated, nickname: nicknameSent })
      setNicknameInput(nicknameSent)
      setIsEditingNickname(false)
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

  function handleLogout() {
    clearAuth()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  function showComingSoon() {
    setComingSoonMessage('준비 중이에요')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-cream items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
      </div>
    )
  }

  if (error || !me) {
    return (
      <div className="flex flex-col h-full bg-cream items-center justify-center px-6 gap-4">
        <p className="text-f16 text-navy-70 text-center">
          {error ?? '사용자 정보를 불러오지 못했어요.'}
        </p>
        <Button variant="ghost" onClick={() => window.location.reload()}>
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex items-center px-6 pt-14 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-f20 text-navy-70 leading-none"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h1 className="text-f20 font-semibold text-navy">마이페이지</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-5">
        <div className="bg-navy-8 rounded-xl px-5 py-5 space-y-3 border border-navy-15 shadow-sm">
          <p className="text-f12 font-medium text-navy-40">계정 정보</p>
          {isEditingNickname ? (
            <div className="space-y-2">
              <input
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="닉네임"
                maxLength={20}
                className="w-full rounded-md px-4 py-3 bg-cream text-f16 text-navy outline-none focus:ring-2 focus:ring-navy-15"
                autoFocus
              />
              <p className={`text-f12 ${trimmedNickname.length < 2 ? 'text-err' : 'text-navy-40'}`}>
                {trimmedNickname.length < 2
                  ? '최소 2자 이상 입력해주세요'
                  : `${trimmedNickname.length}/20`}
              </p>
              {saveError && <p className="text-f12 text-err">{saveError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNickname}
                  disabled={isSaving || !isNicknameValid}
                  className="flex-1 py-2 rounded-md bg-navy text-cream text-f12 font-medium disabled:opacity-40"
                >
                  {isSaving ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={() => {
                    setIsEditingNickname(false)
                    setSaveError(null)
                    setNicknameInput(me.nickname)
                  }}
                  className="flex-1 py-2 rounded-md bg-navy-8 text-navy text-f12 font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-f12 text-navy-40">안녕하세요,</p>
                <p className="text-f20 font-semibold text-navy">{me.nickname}님</p>
                {me.email && <p className="text-f12 text-navy-40 mt-0.5">{me.email}</p>}
              </div>
              <button
                onClick={() => setIsEditingNickname(true)}
                className="text-f12 text-navy-40 border border-navy-15 rounded-pill px-3 py-1 flex-shrink-0 mt-1"
              >
                수정
              </button>
            </div>
          )}
        </div>

        {/* 강아지 */}
        <div>
          <div className="mb-3">
            <p className="text-f16 font-semibold text-navy">내 강아지</p>
          </div>

          {me.dogs.length === 0 ? (
            <div className="bg-navy-5 rounded-xl px-5 py-8 flex flex-col items-center gap-3">
              <span className="text-f40" aria-hidden="true">
                🐾
              </span>
              <p className="text-f16 text-navy-40">아직 등록된 강아지가 없어요</p>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.DOGS.REGISTRATION)}>
                강아지 등록하기
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {me.dogs.map((dog) => {
                const displayName = dog.name && dog.name.trim() ? dog.name : null
                const genderLabel = formatGender(dog.gender)
                const rankLabel = formatRank(dog.rank)
                const hasXp = typeof dog.totalXp === 'number'

                return (
                  <button
                    key={dog.id}
                    onClick={() => navigate(ROUTES.DOGS.DETAIL_OF(dog.id))}
                    className="w-full bg-navy-5 rounded-xl px-5 py-4 flex items-center gap-4 text-left active:opacity-70 transition-opacity"
                  >
                    <DogAvatarImg dog={dog} detail={dogDetailMap.get(dog.id)} />
                    <div className="flex-1 min-w-0">
                      {displayName ? (
                        <p className="text-f16 font-semibold text-navy truncate">{displayName}</p>
                      ) : (
                        <p className="text-f16 italic text-navy-40 truncate">이름을 등록해주세요</p>
                      )}
                      <p className="text-f12 text-navy-40 mt-0.5 truncate">
                        {genderLabel} · {rankLabel}
                        {hasXp ? ` · XP ${dog.totalXp.toLocaleString()}` : ''}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: dog.territoryColor }}
                          aria-hidden="true"
                        />
                        <span className="text-f8 text-navy-40">영토 색상</span>
                      </div>
                    </div>
                    <span className="text-navy-70 text-f16 flex-shrink-0" aria-hidden="true">
                      ›
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 메뉴 */}
        <div className="space-y-1.5">
          <div className="bg-navy-5 rounded-xl overflow-hidden divide-y divide-navy-8">
            <button
              onClick={() => navigate(ROUTES.DOGS.INDEX)}
              className="w-full px-5 py-4 text-left text-f16 text-navy flex items-center justify-between active:opacity-70 transition-opacity"
            >
              <span>강아지 관리</span>
              <span className="text-navy-70" aria-hidden="true">
                ›
              </span>
            </button>
            <button
              onClick={showComingSoon}
              className="w-full px-5 py-4 text-left text-f16 text-navy flex items-center justify-between active:opacity-70 transition-opacity"
            >
              <span>산책 기록</span>
              <span className="text-navy-70" aria-hidden="true">
                ›
              </span>
            </button>
            <button
              onClick={showComingSoon}
              className="w-full px-5 py-4 text-left text-f16 text-navy flex items-center justify-between active:opacity-70 transition-opacity"
            >
              <span>설정</span>
              <span className="text-navy-70" aria-hidden="true">
                ›
              </span>
            </button>
          </div>
          {comingSoonMessage && (
            <p className="text-f12 text-navy-40 text-center py-1">{comingSoonMessage}</p>
          )}
        </div>

        {/* 로그아웃 */}
        <div className="bg-navy-5 rounded-xl overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full px-5 py-4 text-left text-f16 text-err flex items-center active:opacity-70 transition-opacity"
          >
            로그아웃
          </button>
        </div>

        {/* 서비스 정보 */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={showComingSoon}
              className="text-f12 text-navy-40 active:opacity-70 transition-opacity"
            >
              개인정보처리방침
            </button>
            <span className="text-navy-15 text-f12 select-none" aria-hidden="true">
              ·
            </span>
            <button
              onClick={showComingSoon}
              className="text-f12 text-navy-40 active:opacity-70 transition-opacity"
            >
              이용약관
            </button>
            <span className="text-navy-15 text-f12 select-none" aria-hidden="true">
              ·
            </span>
            <button
              onClick={showComingSoon}
              className="text-f12 text-navy-40 active:opacity-70 transition-opacity"
            >
              위치정보 이용약관
            </button>
          </div>
          <p className="text-f12 text-navy-40 text-center">v{APP_VERSION}</p>
        </div>
      </div>
    </div>
  )
}
