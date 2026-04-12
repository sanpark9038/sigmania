export interface SigEntry {
  id: string
  name: string // 매칭용 접두사 (시그 번호)
  image_name: string | null
  audio_name: string | null
  image_url: string | null
  audio_url: string | null
  created_at: string
}

export type SortField = 'name' | 'created_at'
export type SortOrder = 'asc' | 'desc'
