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
} from '../types/walk'

function extractErrorCode(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    (err as { response?: { data?: ApiResponse<unknown> } }).response?.data?.error?.code
  ) {
    return (err as { response: { data: ApiResponse<unknown> } }).response.data.error!.code
  }
  return 'UNKNOWN_ERROR'
}

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

export { extractErrorCode }
