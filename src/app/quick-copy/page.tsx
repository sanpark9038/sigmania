'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  RefreshCw, Check, Upload, X, FileAudio, FileImage, 
  Settings, Play, AlertTriangle, Layout, Terminal, 
  Keyboard, MousePointer2, Info, ChevronRight, Hash,
  Zap, Copy, List as ListIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { SigEntry } from '@/types'
import JSZip from 'jszip'

interface PendingFile {
  name: string;
  type: 'img' | 'aud';
  data: Blob;
}

interface UploadGroup {
  id: string;
  name: string;
  imgFile?: PendingFile;
  audFile?: PendingFile;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

export default function QuickCopyPage() {
  const [files, setFiles] = useState<SigEntry[]>([])
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [copyingType, setCopyingType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showManual, setShowManual] = useState(false)

  // ZIP Upload States
  const [isDragging, setIsDragging] = useState(false)
  const [uploadGroups, setUploadGroups] = useState<UploadGroup[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const fetchFiles = useCallback(async () => {
    setIsLoading(true)
    const { data } = await supabase.from('files').select('*')
    if (data) {
      const sortedData = [...data].sort((a, b) => {
        const numA = parseInt((a.name || '').replace(/[^0-9]/g, '')) || 0
        const numB = parseInt((b.name || '').replace(/[^0-9]/g, '')) || 0
        return numA - numB
      })
      setFiles(sortedData)
      if (sortedData.length > 0 && !focusedId) setFocusedId(sortedData[0].id)
    }
    setIsLoading(false)
  }, [focusedId])

  useEffect(() => {
    fetchFiles()
    document.title = "SNIPER REMOTE v5.1"
  }, [fetchFiles])

  // Copy Logic
  const executeCopy = useCallback(async (file: SigEntry, type: 'id' | 'img' | 'aud') => {
    try {
      let text = '';
      if (type === 'id') text = (file.name || '').replace(/[^0-9]/g, '')
      if (type === 'img') text = file.image_url || ''
      if (type === 'aud') text = file.audio_url || ''
      if (!text) {
        toast.error(`${type.toUpperCase()} 데이터가 없습니다.`, { position: 'top-center' })
        return;
      };

      await navigator.clipboard.writeText(text)
      setCopyingType(`${file.id}-${type}`)
      toast.success(`${type.toUpperCase()} 복사완료`, { 
        duration: 800, 
        position: 'top-center',
        icon: <Check className="w-4 h-4 text-green-400" />
      })
      setTimeout(() => setCopyingType(null), 400)
    } catch (err) {
      toast.error('복사 실패')
    }
  }, [])

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (uploadGroups.length > 0 || isUploading) return;
      if (!focusedId) return
      const file = files.find(f => f.id === focusedId)
      if (!file) return

      if (e.key === '1') executeCopy(file, 'id')
      if (e.key === '2') executeCopy(file, 'img')
      if (e.key === '3') executeCopy(file, 'aud')
      
      const currentIndex = files.findIndex(f => f.id === focusedId)
      if (e.key === 'ArrowDown' && currentIndex < files.length - 1) {
        setFocusedId(files[currentIndex + 1].id)
        document.getElementById(`sig-${files[currentIndex + 1].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        e.preventDefault()
      }
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        setFocusedId(files[currentIndex - 1].id)
        document.getElementById(`sig-${files[currentIndex - 1].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [files, focusedId, executeCopy, uploadGroups.length, isUploading])

  // ZIP Processing
  const handleZipDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file || !file.name.endsWith('.zip')) {
      toast.error('ZIP 파일만 처리 가능합니다.')
      return
    }

    try {
      const zip = await JSZip.loadAsync(file)
      const pendingFiles: PendingFile[] = []
      
      for (const [filename, fileObj] of Object.entries(zip.files)) {
        if (fileObj.dir) continue;
        const blob = await fileObj.async('blob')
        const ext = filename.split('.').pop()?.toLowerCase()
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext!)) {
          pendingFiles.push({ name: filename, type: 'img', data: blob })
        } else if (['mp3', 'wav', 'ogg', 'oga'].includes(ext!)) {
          pendingFiles.push({ name: filename, type: 'aud', data: blob })
        }
      }

      const groups: Record<string, UploadGroup> = {}
      pendingFiles.forEach(pf => {
        const basename = pf.name.split('.')[0]
        const idMatch = basename.match(/^(\d+)/)
        const detectedId = idMatch ? idMatch[1] : ''
        const displayName = basename.replace(/^\d+-/, '').replace(/^\d+/, '') || basename
        const key = detectedId || basename
        if (!groups[key]) groups[key] = { id: detectedId, name: displayName, status: 'pending' }
        if (pf.type === 'img') groups[key].imgFile = pf
        if (pf.type === 'aud') groups[key].audFile = pf
      })

      setUploadGroups(Object.values(groups))
      setShowManual(false)
    } catch (err) {
      toast.error('압축 해제 실패')
    }
  }

  const startBulkUpload = async () => {
    if (uploadGroups.some(g => !g.id)) {
      toast.error('모든 항목의 ID를 확인해주세요.')
      return
    }
    setIsUploading(true)
    for (let i = 0; i < uploadGroups.length; i++) {
      const group = uploadGroups[i]
      try {
        setUploadGroups(prev => prev.map((g, idx) => idx === i ? { ...g, status: 'uploading' } : g))
        let imgUrl = '', audUrl = ''

        if (group.imgFile) {
          const path = `sig-img/${group.id}-${group.imgFile.name}`
          const { error } = await supabase.storage.from('assets').upload(path, group.imgFile.data, { upsert: true })
          if (error) throw error
          const { data } = supabase.storage.from('assets').getPublicUrl(path)
          imgUrl = data.publicUrl
        }

        if (group.audFile) {
          const path = `sig-aud/${group.id}-${group.audFile.name}`
          const { error } = await supabase.storage.from('assets').upload(path, group.audFile.data, { upsert: true })
          if (error) throw error
          const { data } = supabase.storage.from('assets').getPublicUrl(path)
          audUrl = data.publicUrl
        }

        const { error: dbErr } = await supabase.from('files').upsert({
          name: `${group.id}-${group.name}`,
          image_url: imgUrl || undefined,
          audio_url: audUrl || undefined,
        }, { onConflict: 'name' })
        if (dbErr) throw dbErr

        setUploadGroups(prev => prev.map((g, idx) => idx === i ? { ...g, status: 'done' } : g))
      } catch (err) {
        setUploadGroups(prev => prev.map((g, idx) => idx === i ? { ...g, status: 'error' } : g))
      }
    }
    setIsUploading(false)
    toast.success('동기화 완료')
    setTimeout(() => { setUploadGroups([]); fetchFiles(); }, 1500)
  }

  return (
    <main className="min-h-screen bg-[#020617] text-[#F8FAFC] font-sans antialiased selection:bg-blue-500/30">
      {/* 🚀 Tactical Header */}
      <header className="fixed top-0 inset-x-0 h-16 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 z-[100] flex items-center justify-between px-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-widest uppercase text-white">Sniper Remote</h1>
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-white/40 tracking-tighter uppercase">Operational v5.1</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowManual(!showManual)}
            className={`p-2 rounded-lg transition-all ${showManual ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
          >
            <Info className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button onClick={fetchFiles} className="p-2 bg-white/5 rounded-lg text-white/40 hover:bg-white/10 hover:text-white border border-white/5 transition-all">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* 📘 Operational Manual (Floating Glass Card) */}
      {showManual && (
        <div className="fixed top-20 inset-x-4 z-[90] animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="relative bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-3xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] pointer-events-none" />
            
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">Tactical Guide</h3>
              </div>
              <button onClick={() => setShowManual(false)} className="text-white/20 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Bulk Ingest */}
              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-white">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-black uppercase tracking-tight">Bulk Ingestion</span>
                </div>
                <p className="text-[11px] leading-relaxed text-white/50">ZIP 파일을 화면 어디든 드래그하세요. 이미지와 음원이 자동으로 번호 매칭되어 업로드 대기열에 생성됩니다.</p>
              </div>

              {/* Feature 2: Keyboard Shortcuts */}
              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-white">
                  <Keyboard className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-black uppercase tracking-tight">Shortcuts</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-white/40">번호 복사</span><span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/30">1</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-white/40">이미지 복사</span><span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-md border border-green-500/30">2</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-white/40">음원 복사</span><span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-md border border-amber-500/30">3</span>
                  </div>
                </div>
              </div>

              {/* Feature 3: Status Tracking */}
              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-white">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-black uppercase tracking-tight">Integrity Check</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <div className="w-2 h-2 rounded-full bg-red-500" /> <span className="text-white/50">이미지 누락</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <div className="w-2 h-2 rounded-full bg-amber-500" /> <span className="text-white/50">음원 누락</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 Asset Intelligence List */}
      <div 
        className={`pt-24 pb-32 px-4 max-w-2xl mx-auto space-y-3 transition-opacity duration-300 ${isDragging ? 'opacity-20 blur-sm scale-95' : 'opacity-100'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      >
        {files.length === 0 && !isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4 text-white/20">
            <Upload className="w-12 h-12" />
            <p className="text-sm font-black uppercase tracking-widest">No assets deployed</p>
          </div>
        ) : (
          files.map((file) => {
            const isFocused = focusedId === file.id
            const pureId = (file.name || '').replace(/[^0-9]/g, '')
            return (
              <div
                key={file.id}
                id={`sig-${file.id}`}
                onClick={() => setFocusedId(file.id)}
                className={`group relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border cursor-pointer overflow-hidden ${isFocused ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_10px_40px_rgba(37,99,235,0.15)] scale-[1.02]' : 'bg-[#1E293B]/40 border-white/5 hover:border-white/10 hover:bg-[#1E293B]/60'}`}
              >
                {/* Selection Glow */}
                {isFocused && <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)]" />}
                
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-3xl font-black italic tracking-tighter transition-colors ${isFocused ? 'text-white' : 'text-white/30'}`}>{pureId}</span>
                    <div className="flex gap-1.5">
                      {!file.image_url && <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />}
                      {!file.audio_url && <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]" />}
                    </div>
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-[0.2em] truncate transition-colors ${isFocused ? 'text-blue-400' : 'text-white/10'}`}>
                    {file.name?.split('-')[1] || '---'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((num) => {
                    const type = ['id', 'img', 'aud'][num - 1] as 'id' | 'img' | 'aud'
                    const isCopying = copyingType === `${file.id}-${type}`
                    return (
                      <button 
                        key={num}
                        onClick={(e) => { e.stopPropagation(); executeCopy(file, type); }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-black border transition-all active:scale-90 ${isCopying ? 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/20 scale-110' : isFocused ? 'bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-400' : 'bg-black/20 border-white/5 text-white/10'}`}
                      >
                        {isCopying ? <Check className="w-4 h-4" /> : num}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 📥 Drop Zone Overlay */}
      {isDragging && (
        <div 
          className="fixed inset-0 bg-blue-600/40 backdrop-blur-3xl z-[200] flex items-center justify-center animate-in zoom-in duration-300"
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleZipDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="bg-black/40 p-12 rounded-[4rem] border border-white/20 shadow-4xl flex flex-col items-center gap-6 scale-110">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center animate-bounce shadow-2xl">
              <Upload className="w-12 h-12 text-blue-600" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase mb-2">Engage Bulk Upload</h2>
              <p className="text-white/60 font-medium tracking-widest text-xs uppercase">Release ZIP to start analyze</p>
            </div>
          </div>
        </div>
      )}

      {/* 🛠️ Upload Registry Modal */}
      {uploadGroups.length > 0 && (
        <div className="fixed inset-0 bg-[#020617]/98 z-[300] backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="max-w-3xl mx-auto h-full flex flex-col pt-12">
            <div className="flex items-center justify-between px-8 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <Terminal className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Upload Registry</h2>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{uploadGroups.length} Items Detected</p>
                </div>
              </div>
              <button 
                onClick={() => setUploadGroups([])}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all group"
              >
                <X className="w-5 h-5 text-white/40 group-hover:text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 space-y-3 pb-40 scroll-smooth">
              {uploadGroups.map((group, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 p-5 rounded-3xl flex items-center justify-between group-hover:border-white/10 transition-all">
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      <input 
                        type="text"
                        value={group.id}
                        onChange={(e) => setUploadGroups(prev => prev.map((g, i) => i === idx ? { ...g, id: e.target.value } : g))}
                        className={`w-24 bg-black/60 border-2 rounded-2xl px-4 py-3 text-2xl font-black focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-center ${!group.id ? 'border-red-500/50 text-red-500' : 'border-blue-500 text-blue-400'}`}
                      />
                      <Hash className="absolute -top-2 -left-2 w-5 h-5 text-blue-500/40" />
                    </div>
                    <div>
                      <h4 className="font-black text-white uppercase tracking-tight mb-1">{group.name}</h4>
                      <div className="flex gap-4">
                        {group.imgFile && <div className="flex items-center gap-1.5 text-[9px] font-black bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md">IMG</div>}
                        {group.audFile && <div className="flex items-center gap-1.5 text-[9px] font-black bg-purple-500/10 text-purple-400 px-2 py-1 rounded-md">AUD</div>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {group.status === 'uploading' && <RefreshCw className="animate-spin text-blue-500" />}
                    {group.status === 'done' && <div className="bg-green-500 rounded-full p-1.5 shadow-[0_0_15px_rgba(34,197,94,0.5)]"><Check className="w-4 h-4 text-white" /></div>}
                    {group.status === 'error' && <X className="text-red-500" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="fixed bottom-0 inset-x-0 p-8 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent z-[301]">
              <div className="max-w-xl mx-auto flex gap-4">
                <button 
                  onClick={() => setUploadGroups([])}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest text-white/50 transition-all"
                >
                  Terminate
                </button>
                <button 
                  onClick={startBulkUpload}
                  disabled={isUploading || uploadGroups.some(g => !g.id)}
                  className={`flex-[2] py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale`}
                >
                  {isUploading ? <><RefreshCw className="animate-spin w-5 h-5" /> Processing</> : <><Play className="w-5 h-5 fill-current" /> Execute Sync</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⌨️ Fixed Footer Overlay */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600/90 backdrop-blur-xl px-1 sm:px-2 py-1 sm:py-2 rounded-2xl shadow-3xl shadow-blue-600/20 border border-white/20 flex items-center gap-1 sm:gap-2 z-50">
        <div className="flex items-center gap-1 px-3 py-2 bg-black/20 rounded-xl">
           <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter mr-2">Shortcuts</span>
           <div className="flex gap-2 text-[10px] font-black">
             <span className="text-white">1 ID</span>
             <span className="text-white">2 IMG</span>
             <span className="text-white">3 AUD</span>
           </div>
        </div>
        <div className="w-px h-6 bg-white/10 mx-1" />
        <div className="px-3 py-2 flex items-center gap-2">
           <span className="text-[10px] font-black text-white uppercase tracking-widest">{files.length} ITEMS</span>
        </div>
      </footer>
    </main>
  )
}
