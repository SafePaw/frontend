import type { ApiResponse } from '../types/common'

export function extractErrorCode(err: unknown): string {
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

export function extractErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    (err as { response?: { data?: ApiResponse<unknown> } }).response?.data?.error?.message
  ) {
    return (err as { response: { data: ApiResponse<unknown> } }).response.data.error!.message
  }
  if (err instanceof Error) return err.message
  return '알 수 없는 오류가 발생했습니다.'
}
