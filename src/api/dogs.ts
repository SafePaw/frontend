import { apiClient } from './client'
import type { ApiResponse } from '../types/common'
import type {
  CreateDogRequest,
  UpdateDogRequest,
  Dog,
  MarkerUploadUrlRequest,
  MarkerUploadUrlResponse,
} from '../types/dog'

export async function getDogs(): Promise<Dog[]> {
  const res = await apiClient.get<ApiResponse<Dog[]>>('/dogs')
  if (!res.data.success || !res.data.data) {
    throw new Error('강아지 목록 조회에 실패했습니다.')
  }
  return res.data.data
}

export async function createDog(body: CreateDogRequest): Promise<Dog> {
  const res = await apiClient.post<ApiResponse<Dog>>('/dogs', body)
  if (!res.data.success || !res.data.data) {
    throw new Error('강아지 등록에 실패했습니다.')
  }
  return res.data.data
}

export async function updateDog(dogId: number, body: UpdateDogRequest): Promise<Dog> {
  const res = await apiClient.patch<ApiResponse<Dog>>(`/dogs/${dogId}`, body)
  if (!res.data.success || !res.data.data) {
    throw new Error('강아지 정보 수정에 실패했습니다.')
  }
  return res.data.data
}

export async function deleteDog(dogId: number): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`/dogs/${dogId}`)
}

export async function getDogMarkerUploadUrl(
  body: MarkerUploadUrlRequest,
): Promise<MarkerUploadUrlResponse> {
  const res = await apiClient.post<ApiResponse<MarkerUploadUrlResponse>>(
    '/dogs/marker/upload-url',
    body,
  )
  if (!res.data.success || !res.data.data) {
    throw new Error('마커 업로드 URL 생성에 실패했습니다.')
  }
  return res.data.data
}

export async function uploadDogMarkerToPresignedUrl(
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
    throw new Error(`마커 이미지 업로드에 실패했습니다. (status: ${res.status})`)
  }
}
