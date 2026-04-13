'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Upload, 
  Music, 
  Image as ImageIcon, 
  Loader2, 
  ArrowUpDown, 
  ExternalLink, 
  LinkIcon, 
  Check, 
  LayoutGrid, 
  List, 
  AlertTriangle,
  Zap,
  Layout,
  Database,
  ArrowUp
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { SigEntry, SortField, SortOrder } from '@/types'
import { SigTableRow } from '@/components/SigTableRow'
import { SigGridItem } from '@/components/SigGridItem'
import { useRouter } from 'next/navigation'
import sampleRefined from '../../sample_refined.json'

const titleMap = new Map<string, string>()
sampleRefined.forEach(item => {
  titleMap.set(item.sig_number.toString(), item.title)
})

export default function HomePage() {
  const [isDragging, setIsDragging] = useState<'image' | 'audio' | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [files, setFiles] = useState<SigEntry[]>([])
  const [copyingId, setCopyingId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const fetchFiles = useCallback(async () => {
    const { data, error } = await supabase
      .from('files')
      .select('*')
    // 제거: .order(sortField, { ascending: sortOrder === 'asc' })

    if (data) {
      const sortedData = [...data].sort((a, b) => {
        if (sortField === 'name') {
          const numA = parseInt((a.name || '').replace(/[^0-9]/g, '')) || 0
          const numB = parseInt((b.name || '').replace(/[^0-9]/g, '')) || 0
          return sortOrder === 'asc' ? numA - numB : numB - numA
        } else {
          // 작성일 정렬 등 다른 필드는 기본 정렬 유지
          const valA = a[sortField] || ''
          const valB = b[sortField] || ''
          if (valA < valB) return sortOrder === 'asc' ? -1 : 1
          if (valA > valB) return sortOrder === 'asc' ? 1 : -1
          return 0
        }
      })
      setFiles(sortedData)
    }
    if (error) console.error(error)
  }, [sortField, sortOrder])

  useEffect(() => {
    fetchFiles()
    const channel = supabase
      .channel('public:files')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'files' }, () => fetchFiles())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchFiles])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handleCopyUrl = (id: string, url: string, type: 'img' | 'aud') => {
    navigator.clipboard.writeText(url)
    setCopyingId(`${id}-${type}`)
    toast.success(`${type === 'img' ? '이미지' : '음원'} URL 복사 완료!`)
    setTimeout(() => setCopyingId(null), 2000)
  }

  const openQuickManager = () => {
    const width = 360;
    const height = 800;
    const left = window.screen.width - width;
    const top = 0;
    window.open(
      '/quick-copy', 
      'SigmaniaQuickManager', 
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );
  }

  const handleDeleteFile = async (id: string, imageUrl: string | null, audioUrl: string | null) => {
    if (!confirm('정말 이 항목을 삭제하시겠습니까? (이미지와 음원 모두 삭제됩니다)')) return
    const toastId = toast.loading('항목 및 스토리지 파일 삭제 중...')
    try {
      if (imageUrl) {
        const imageName = imageUrl.split('/').pop()
        if (imageName) await supabase.storage.from('images').remove([imageName])
      }
      if (audioUrl) {
        const audioName = audioUrl.split('/').pop()
        if (audioName) await supabase.storage.from('audio').remove([audioName])
      }
      const { error } = await supabase.from('files').delete().eq('id', id)
      if (error) throw error
      toast.success('성공적으로 삭제되었습니다!', { id: toastId })
      fetchFiles()
    } catch (error: any) {
      toast.error(`삭제 에러: ${error.message}`, { id: toastId })
    }
  }

  const handleFileUpload = async (type: 'image' | 'audio', e: any) => {
    let filesToUpload: File[] = []
    if (e.target.files) filesToUpload = Array.from(e.target.files)
    else if (e.dataTransfer.files) filesToUpload = Array.from(e.dataTransfer.files)
    if (filesToUpload.length === 0) return

    const MAX_SIZE = 30 * 1024 * 1024
    const ALLOWED_EXTS = type === 'image' ? ['png', 'gif', 'jpg', 'jpeg', 'webp'] : ['mp3', 'ogg', 'oga']

    setIsUploading(true)
    const toastId = toast.loading(`${type === 'image' ? '이미지' : '음원'} 업로드 중...`)
    
    try {
      for (const file of filesToUpload) {
        const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
        const baseName = file.name.replace(/\.[^/.]+$/, "") 
        const matchPrefix = baseName.match(/^\d+/)?.[0] || baseName

        if (file.size > MAX_SIZE) throw new Error(`${file.name}: 30MB 제한 초과`)
        if (!ALLOWED_EXTS.includes(fileExt)) throw new Error(`${file.name}: 허용되지 않는 확장자`)

        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const bucket = type === 'image' ? 'images' : 'audio'
        const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)

        const { data: existing } = await supabase
          .from('files')
          .select('*')
          .eq('name', matchPrefix)
          .single()

        if (existing) {
          const isImage = type === 'image'
          const existingUrl = isImage ? existing.image_url : existing.audio_url
          
          // 핵심: 해당 타입(이미지면 이미지, 음원이면 음원)이 이미 '실제로' 있을 때만 교체 여부를 묻습니다.
          if (existingUrl) {
            if (!confirm(`[${matchPrefix}]번의 ${isImage ? '이미지' : '음원'}가 이미 존재합니다. 새로운 파일로 교체하시겠습니까?\n(기존 파일은 스토리지에서 삭제됩니다)`)) {
              continue
            }

            // 1. 기존 파일 스토리지에서 삭제
            const oldFileName = existingUrl.split('/').pop()
            if (oldFileName) {
              await supabase.storage.from(isImage ? 'images' : 'audio').remove([oldFileName])
            }
          }

          // 2. DB 업데이트 (이미 존재하면 해당 타입만 업데이트)
          const updateData = isImage 
            ? { image_url: publicUrl, image_name: file.name } 
            : { audio_url: publicUrl, audio_name: file.name }
          await supabase.from('files').update(updateData).eq('id', existing.id)
        } else {
          await supabase.from('files').insert({
            name: matchPrefix,
            image_url: type === 'image' ? publicUrl : null,
            image_name: type === 'image' ? file.name : null,
            audio_url: type === 'audio' ? publicUrl : null,
            audio_name: type === 'audio' ? file.name : null
          })
        }
      }
      toast.success('처리가 완료되었습니다!', { id: toastId })
      fetchFiles()
    } catch (error: any) {
      toast.error(`업로드 실패: ${error.message}`, { id: toastId })
    } finally {
      setIsUploading(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
      if (audioInputRef.current) audioInputRef.current.value = ''
    }
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-[#f2f2f2] p-6 md:p-12 max-w-7xl mx-auto space-y-10 font-sans">
      {/* 1. 브랜드 & 현황판 (스크롤됨) */}
      <div className="space-y-8">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
          <div className="space-y-3">
            <h1 className="text-5xl font-black tracking-tighter text-white bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">SIGMANIA <span className="text-blue-500 font-light text-3xl ml-1">v5.1</span></h1>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[12px] font-bold text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>파일당 30MB 제한</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[12px] font-bold text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>.png, .gif, .jpg, .jpeg, .webp</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[12px] font-bold text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>.mp3, .ogg, .oga</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[12px] font-bold text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>숫자 자동 정렬</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button 
              onClick={openQuickManager}
              className="group px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white text-xl font-black rounded-2xl transition-all flex items-center gap-3 shadow-[0_10px_40px_rgba(37,99,235,0.3)] active:scale-95 border border-white/10"
            >
              <Zap className="w-7 h-7 fill-current group-hover:rotate-12 transition-transform" />
              <span>시그 퀵리모컨 실행</span>
            </button>
            
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner">
              <button 
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/30 hover:text-white/60'}`}
              >
                <LayoutGrid className="w-5 h-5" />
                <span>그리드</span>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/30 hover:text-white/60'}`}
              >
                <List className="w-5 h-5" />
                <span>리스트</span>
              </button>
            </div>
          </div>
        </header>

        {/* 개수 목록 현황판 & 누락 자산 리스트 */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 py-4 px-6 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-black text-white/50 uppercase tracking-widest">개수 목록</span>
            </div>
            <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block"></div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/30 uppercase">총 시그 세트</span>
                <span className="text-xl font-black text-white">{files.length} <span className="text-sm text-white/40">개</span></span>
              </div>
              <div className="flex flex-col border-l border-white/5 pl-6">
                <span className="text-[10px] font-black text-white/30 uppercase">이미지 보유</span>
                <span className="text-xl font-black text-blue-400">{files.filter(f => f.image_url).length} <span className="text-sm text-white/40">개</span></span>
              </div>
              <div className="flex flex-col border-l border-white/5 pl-6">
                <span className="text-[10px] font-black text-white/30 uppercase">음원 보유</span>
                <span className="text-xl font-black text-purple-400">{files.filter(f => f.audio_url).length} <span className="text-sm text-white/40">개</span></span>
              </div>
            </div>
          </div>

          {/* 누락 자산 다이렉트 리스트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 이미지 누락 */}
            <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-black text-red-400 uppercase tracking-tighter">이미지가 없는 시그목록</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                {files.filter(f => !f.image_url).length === 0 ? (
                  <span className="text-xs text-white/20">누락 없음</span>
                ) : (
                  files.filter(f => !f.image_url).map(f => (
                    <span key={f.id} className="px-2 py-1 bg-red-500/10 text-red-400 text-[11px] font-black rounded-md border border-red-500/20">{f.name.split('-')[0]}</span>
                  ))
                )}
              </div>
            </div>

            {/* 음원 누락 */}
            <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black text-amber-400 uppercase tracking-tighter">음원이 없는 시그목록</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                {files.filter(f => !f.audio_url).length === 0 ? (
                  <span className="text-xs text-white/20">누락 없음</span>
                ) : (
                  files.filter(f => !f.audio_url).map(f => (
                    <span key={f.id} className="px-2 py-1 bg-amber-500/10 text-amber-400 text-[11px] font-black rounded-md border border-amber-500/20">{f.name.split('-')[0]}</span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 업로드 존 (상단 고정) */}
      <div className="sticky top-0 z-[60] bg-[#0d0d0d]/95 backdrop-blur-2xl py-6 border-b border-white/5">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div onDragOver={(e) => { e.preventDefault(); setIsDragging('image'); }} onDragLeave={() => setIsDragging(null)} onDrop={(e) => { e.preventDefault(); setIsDragging(null); handleFileUpload('image', e); }} onClick={() => imageInputRef.current?.click()} className={`relative h-20 border-2 border-dashed rounded-2xl transition-all cursor-pointer flex flex-row items-center justify-center gap-4 group ${isDragging === 'image' ? 'border-blue-500 bg-blue-500/10 scale-[1.01]' : 'border-white/10 hover:border-blue-500/40 hover:bg-white/5'} ${isUploading ? 'opacity-50' : ''}`}>
            <ImageIcon className={`w-6 h-6 ${isDragging === 'image' ? 'text-blue-500' : 'text-blue-400'}`} />
            <p className="text-xs font-black uppercase tracking-widest text-white/50 group-hover:text-blue-400 transition-colors">시그 이미지 드래그 (벌크)</p>
            <input type="file" ref={imageInputRef} onChange={(e) => handleFileUpload('image', e)} className="hidden" accept="image/*" multiple />
          </div>

          <div onDragOver={(e) => { e.preventDefault(); setIsDragging('audio'); }} onDragLeave={() => setIsDragging(null)} onDrop={(e) => { e.preventDefault(); setIsDragging(null); handleFileUpload('audio', e); }} onClick={() => audioInputRef.current?.click()} className={`relative h-20 border-2 border-dashed rounded-2xl transition-all cursor-pointer flex flex-row items-center justify-center gap-4 group ${isDragging === 'audio' ? 'border-purple-500 bg-purple-500/10 scale-[1.01]' : 'border-white/10 hover:border-purple-500/40 hover:bg-white/5'} ${isUploading ? 'opacity-50' : ''}`}>
            <Music className={`w-6 h-6 ${isDragging === 'audio' ? 'text-purple-500' : 'text-purple-400'}`} />
            <p className="text-xs font-black uppercase tracking-widest text-white/50 group-hover:text-purple-400 transition-colors">시그 음원 드래그 (벌크)</p>
            <input type="file" ref={audioInputRef} onChange={(e) => handleFileUpload('audio', e)} className="hidden" accept="audio/*" multiple />
          </div>
        </section>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white italic tracking-tighter">시그 자산 목록 <span className="text-blue-500 ml-2">[{files.length}]</span></h2>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map((file) => (
              <SigGridItem 
                key={file.id} 
                file={file} 
                title={titleMap.get(file.name.replace(/[^0-9]/g, ''))}
                copyingId={copyingId} 
                onCopy={handleCopyUrl} 
                onDelete={handleDeleteFile} 
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden border border-white/10 rounded-2xl bg-[#141415]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 align-middle">
                  <th onClick={() => toggleSort('name')} className="px-8 py-5 text-[13px] font-black text-white/50 uppercase tracking-widest w-1/4 cursor-pointer hover:text-white transition-colors">시그 갯수 (매칭번호) <ArrowUpDown className="inline w-4 h-4 ml-1" /></th>
                  <th className="px-8 py-5 text-[13px] font-black text-white/50 uppercase tracking-widest text-center">이미지 미리보기</th>
                  <th className="px-8 py-5 text-[13px] font-black text-white/50 uppercase tracking-widest text-center">음원 미리보기</th>
                  <th onClick={() => toggleSort('created_at')} className="px-8 py-5 text-[13px] font-black text-white/50 uppercase tracking-widest w-1/8 cursor-pointer hover:text-white transition-colors text-right">
                    <div className="flex items-center justify-end gap-1 whitespace-nowrap">등록일 <ArrowUpDown className="w-4 h-4" /></div>
                  </th>
                  <th className="px-8 py-5 text-[13px] font-black text-white/50 uppercase tracking-widest w-24 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {files.map((file) => (
                  <SigTableRow 
                    key={file.id} 
                    file={file} 
                    title={titleMap.get(file.name.replace(/[^0-9]/g, ''))}
                    copyingId={copyingId} 
                    onCopy={handleCopyUrl} 
                    onDelete={handleDeleteFile} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 스크롤 TOP 버튼 */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_10px_40px_rgba(37,99,235,0.4)] flex items-center justify-center transition-all active:scale-90 z-[100] border border-white/20 group hover:-translate-y-2"
      >
        <ArrowUp className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </button>
    </main>
  )
}
