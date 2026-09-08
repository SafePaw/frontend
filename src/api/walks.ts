import { apiClient } from './client'
import type { ApiResponse } from '../types/common'
import type {
  WalkStartResponse,
  WalkPointDto,
  WalkLiveStats,
  WalkPauseResponse,
  WalkResumeResponse,
  WalkFinishResponse,
  WalkDetailResponse,
  ActiveWalksResponse,
  WalkHistoryPage,
  WalkSummaryResponse,
  ShareCardUploadUrlResponse,
  ShareCardRequest,
  ShareCardResponse,
} from '../types/walk'

export async function startWalk(dogId: number): Promise<WalkStartResponse> {
  const res = await apiClient.post<ApiResponse<WalkStartResponse>>('/walks', { dogId })
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '산책 시작에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function uploadPoints(
  walkId: number,
  points: WalkPointDto[],
  idempotencyKey?: string,
): Promise<void> {
  const headers: Record<string, string> = {}
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
  await apiClient.post<ApiResponse<null>>(`/walks/${walkId}/points`, { points }, { headers })
}

export async function pauseWalk(walkId: number): Promise<WalkPauseResponse> {
  const res = await apiClient.post<ApiResponse<WalkPauseResponse>>(`/walks/${walkId}/pause`)
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '일시정지에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function resumeWalk(walkId: number): Promise<WalkResumeResponse> {
  const res = await apiClient.post<ApiResponse<WalkResumeResponse>>(`/walks/${walkId}/resume`)
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '재개에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function finishWalk(
  walkId: number,
  lastPoints: WalkPointDto[] | null,
  idempotencyKey?: string,
): Promise<WalkFinishResponse> {
  const headers: Record<string, string> = {}
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
  const res = await apiClient.post<ApiResponse<WalkFinishResponse>>(
    `/walks/${walkId}/finish`,
    { lastPoints },
    { headers },
  )
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '산책 종료에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function abortWalk(walkId: number): Promise<void> {
  const res = await apiClient.post<ApiResponse<null>>(`/walks/${walkId}/abort`)
  if (!res.data.success) {
    throw Object.assign(new Error(res.data.error?.message ?? '산책 중단에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
}

export async function getWalkLive(walkId: number): Promise<WalkLiveStats> {
  const res = await apiClient.get<ApiResponse<WalkLiveStats>>(`/walks/${walkId}/live`)
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '실시간 통계 조회에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function getWalkDetail(walkId: number): Promise<WalkDetailResponse> {
  const res = await apiClient.get<ApiResponse<WalkDetailResponse>>(`/walks/${walkId}`)
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '산책 상세 조회에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function getActiveWalks(dogId?: number): Promise<ActiveWalksResponse> {
  const res = await apiClient.get<ApiResponse<ActiveWalksResponse>>('/walks/active', {
    params: dogId !== undefined ? { dogId } : undefined,
  })
  if (!res.data.success || !res.data.data) {
    throw new Error('활성 산책 조회에 실패했습니다.')
  }
  return res.data.data
}

export async function getMyWalks(params?: {
  page?: number
  size?: number
}): Promise<WalkHistoryPage> {
  const res = await apiClient.get<ApiResponse<WalkHistoryPage>>('/me/walks', { params })
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error?.message ?? '산책 기록 조회에 실패했습니다.')
  }
  return res.data.data
}

export async function getWalkSummary(walkId: number): Promise<WalkSummaryResponse> {
  const res = await apiClient.get<ApiResponse<WalkSummaryResponse>>(`/walks/${walkId}/summary`)
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '산책 요약 조회에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function getShareCardUploadUrl(
  walkId: number,
  type: 'BACKGROUND' | 'RENDERED',
  contentType: string,
): Promise<ShareCardUploadUrlResponse> {
  const res = await apiClient.get<ApiResponse<ShareCardUploadUrlResponse>>(
    `/walks/${walkId}/share-card/upload-url`,
    { params: { type, contentType } },
  )
  if (!res.data.success || !res.data.data) {
    throw Object.assign(
      new Error(res.data.error?.message ?? '이미지 업로드 URL 발급에 실패했습니다.'),
      {
        code: res.data.error?.code,
      },
    )
  }
  return res.data.data
}

export async function uploadShareCardImageToPresignedUrl(
  uploadUrl: string,
  image: Blob,
): Promise<void> {
  let res: Response
  try {
    res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': image.type },
      body: image,
      credentials: 'omit',
    })
  } catch {
    throw new Error(
      '이미지 저장 서버에 연결하지 못했습니다. 네트워크 연결 또는 서버의 업로드 허용 설정을 확인해 주세요.',
    )
  }
  if (!res.ok) throw new Error(`이미지 업로드에 실패했습니다. (status: ${res.status})`)
}

export async function saveShareCard(
  walkId: number,
  body: ShareCardRequest,
): Promise<ShareCardResponse> {
  const res = await apiClient.post<ApiResponse<ShareCardResponse>>(
    `/walks/${walkId}/share-card`,
    body,
  )
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '공유카드 저장에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function getShareCard(walkId: number): Promise<ShareCardResponse> {
  const res = await apiClient.get<ApiResponse<ShareCardResponse>>(`/walks/${walkId}/share-card`)
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '공유카드 조회에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export { extractErrorCode } from '../utils/apiError'
