import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { AssetService } from '@/services/assetService'
import { SigEntry } from '@/types'

export function useAssets() {
  const [isUploading, setIsUploading] = useState(false)
  const [files, setFiles] = useState<SigEntry[]>([])

  const fetchFiles = useCallback(async (sortField: string, sortOrder: string) => {
    try {
      const data = await AssetService.fetchAll()
      const sortedData = [...data].sort((a: SigEntry, b: SigEntry) => {
        if (sortField === 'name') {
          const numA = parseInt((a.name || '').replace(/[^0-9]/g, '')) || 0
          const numB = parseInt((b.name || '').replace(/[^0-9]/g, '')) || 0
          return sortOrder === 'asc' ? numA - numB : numB - numA
        }
        const valA = (a as unknown as Record<string, string | null>)[sortField] || ''
        const valB = (b as unknown as Record<string, string | null>)[sortField] || ''
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
      setFiles(sortedData)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류'
      toast.error(`데이터 로드 실패: ${errorMessage}`)
    }
  }, [])

  const deleteAsset = async (id: string, imageUrl: string | null, audioUrl: string | null) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const toastId = toast.loading('삭제 중...')
    try {
      await AssetService.delete(id, imageUrl, audioUrl)
      toast.success('삭제 완료', { id: toastId })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류'
      toast.error(`삭제 실패: ${errorMessage}`, { id: toastId })
    }
  }

  return {
    files,
    isUploading,
    setIsUploading,
    fetchFiles,
    deleteAsset,
    uploadFile: AssetService.uploadFile
  }
}
