import { apiClient } from './client'
import type { ApiResponse } from '../types/common'
import type {
  CrewResponse,
  CrewMember,
  CrewCreateRequest,
  CrewUpdateRequest,
  CrewJoinRequest,
  CrewTransferRequest,
  CrewImageUploadRequest,
  CrewImageUploadResponse,
} from '../types/crew'

export async function getCrewImageUploadUrl(
  body: CrewImageUploadRequest,
): Promise<CrewImageUploadResponse> {
  const res = await apiClient.post<ApiResponse<CrewImageUploadResponse>>(
    '/crews/image/upload-url',
    body,
  )
  if (!res.data.success || !res.data.data) {
    throw new Error('이미지 업로드 URL 생성에 실패했습니다.')
  }
  return res.data.data
}

export async function uploadCrewImageToPresignedUrl(
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  })
  if (!res.ok) {
    throw new Error(`이미지 업로드에 실패했습니다. (status: ${res.status})`)
  }
}

export async function createCrew(body: CrewCreateRequest): Promise<CrewResponse> {
  const res = await apiClient.post<ApiResponse<CrewResponse>>('/crews', body)
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '크루 생성에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function joinCrew(body: CrewJoinRequest): Promise<CrewResponse> {
  const res = await apiClient.post<ApiResponse<CrewResponse>>('/crews/join', body)
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '크루 가입에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function getMyCrew(): Promise<CrewResponse> {
  const res = await apiClient.get<ApiResponse<CrewResponse>>('/crews/me')
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '크루 조회에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function getCrewDetail(crewId: number): Promise<CrewResponse> {
  const res = await apiClient.get<ApiResponse<CrewResponse>>(`/crews/${crewId}`)
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '크루 조회에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function updateCrew(crewId: number, body: CrewUpdateRequest): Promise<CrewResponse> {
  const res = await apiClient.patch<ApiResponse<CrewResponse>>(`/crews/${crewId}`, body)
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '크루 수정에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function disbandCrew(crewId: number): Promise<void> {
  const res = await apiClient.delete<ApiResponse<null>>(`/crews/${crewId}`)
  if (!res.data.success) {
    throw Object.assign(new Error(res.data.error?.message ?? '크루 해산에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
}

export async function leaveCrew(crewId: number): Promise<void> {
  const res = await apiClient.post<ApiResponse<null>>(`/crews/${crewId}/leave`)
  if (!res.data.success) {
    throw Object.assign(new Error(res.data.error?.message ?? '크루 탈퇴에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
}

export async function rotateInviteCode(crewId: number): Promise<CrewResponse> {
  const res = await apiClient.post<ApiResponse<CrewResponse>>(`/crews/${crewId}/invite-code`)
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '초대 코드 재발급에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function transferLeader(
  crewId: number,
  body: CrewTransferRequest,
): Promise<CrewResponse> {
  const res = await apiClient.post<ApiResponse<CrewResponse>>(`/crews/${crewId}/transfer`, body)
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '리더 위임에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function getCrewMembers(crewId: number): Promise<CrewMember[]> {
  const res = await apiClient.get<ApiResponse<CrewMember[]>>(`/crews/${crewId}/members`)
  if (!res.data.success || !res.data.data) {
    throw Object.assign(new Error(res.data.error?.message ?? '멤버 목록 조회에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
  return res.data.data
}

export async function kickMember(crewId: number, userId: number): Promise<void> {
  const res = await apiClient.delete<ApiResponse<null>>(`/crews/${crewId}/members/${userId}`)
  if (!res.data.success) {
    throw Object.assign(new Error(res.data.error?.message ?? '멤버 강퇴에 실패했습니다.'), {
      code: res.data.error?.code,
    })
  }
}
