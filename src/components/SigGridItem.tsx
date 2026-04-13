import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Copy, Trash2, Check, Music, ImageIcon } from 'lucide-react'
import { SigEntry } from '@/types'

interface SigGridItemProps {
  file: SigEntry
  title?: string
  copyingId: string | null
  onCopy: (id: string, url: string, type: 'img' | 'aud') => void
  onDelete: (id: string, imageUrl: string | null, audioUrl: string | null) => void
}

export function SigGridItem({ file, title, copyingId, onCopy, onDelete }: SigGridItemProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const pureId = (file.name || '').replace(/[^0-9]/g, '')
  const displayName = file.name?.split('-')[1] || file.name || '---'
  
  const isCopyingImg = copyingId === `${file.id}-img`
  const isCopyingAud = copyingId === `${file.id}-aud`

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!file.audio_url) return

    if (!audioRef.current) {
      audioRef.current = new Audio(file.audio_url)
      audioRef.current.onended = () => setIsPlaying(false)
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      // Stop any other audio if desired (global state needed for true exclusivity, but this handles local)
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <div className="group relative bg-[#1A1A1B] rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/50 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col">
      {/* 이미지 영역 - 100% 개방 */}
      <div className="relative aspect-video bg-black/40 overflow-hidden">
        {file.image_url ? (
          <img 
            src={file.image_url} 
            alt={displayName} 
            className="w-full h-full object-contain transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10 uppercase font-black tracking-tighter text-4xl italic">
            {pureId}
          </div>
        )}
        
        {/* 이미지 복사 오버레이 (마우스 올릴 때만 살짝) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button 
            onClick={() => file.image_url && onCopy(file.id, file.image_url, 'img')}
            className={`p-4 rounded-full transition-all transform hover:scale-110 active:scale-90 ${isCopyingImg ? 'bg-green-500 text-white' : 'bg-white/20 backdrop-blur-md hover:bg-blue-600 text-white shadow-2xl'}`}
          >
            {isCopyingImg ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 정보 영역 - 초간결 모드 */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             {/* 재생 버튼 - ID 옆으로 배치 */}
             {file.audio_url && (
                <button 
                  onClick={togglePlay}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 border border-white/10 ${isPlaying ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-white/5 text-blue-400 hover:bg-blue-600 hover:text-white'}`}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                </button>
             )}
             <span className="text-3xl font-black italic text-white tracking-widest leading-none">{pureId}</span>
          </div>
        </div>

        {title && (
          <div className="mb-4 px-1 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-[11px] font-bold text-blue-400 text-center truncate px-1">
              {title}
            </p>
          </div>
        )}
        
        <div className="mt-auto flex items-center gap-2">
           <button 
            onClick={() => file.audio_url && onCopy(file.id, file.audio_url, 'aud')}
            className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all border border-white/5 ${isCopyingAud ? 'bg-green-500 text-white border-transparent' : 'bg-white/5 hover:bg-blue-600 text-white/60 hover:text-white hover:border-transparent text-center'}`}
          >
            {isCopyingAud ? <Check className="w-4 h-4"/> : <><Music className="w-4 h-4"/> COPY</>}
          </button>

          <button 
            onClick={() => onDelete(file.id, file.image_url, file.audio_url)}
            className="w-12 h-12 flex items-center justify-center bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all border border-white/5"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
