export interface SigEntry {
  id: string
  name: string
  image_name: string | null
  audio_name: string | null
  image_url: string | null
  thumb_url: string | null
  audio_url: string | null
  created_at: string
}

export type SortField = 'name' | 'created_at'
export type SortOrder = 'asc' | 'desc'
