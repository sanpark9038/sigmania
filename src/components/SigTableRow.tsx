'use client'

import Image from 'next/image'
import { ImageIcon, Music, Play, LinkIcon, Check, Trash2 } from 'lucide-react'
import { SigEntry } from '@/types'

interface Props {
  file: SigEntry
  title?: string
  copyingId: string | null
  onCopy: (id: string, url: string, type: 'img' | 'aud') => void
  onDelete: (
    id: string,
    img: string | null,
    aud: string | null,
    thumbUrl?: string | null
  ) => void
}

export function SigTableRow({ file, title, copyingId, onCopy, onDelete }: Props) {
  const previewUrl = file.thumb_url || file.image_url

  return (
    <tr className="hover:bg-white/[0.02] transition-all group border-b border-white/5 last:border-0">
      <td className="px-10 py-10">
        <div className="flex flex-col gap-1">
          <div className="text-5xl font-black text-white tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">
            {file.name}
          </div>
          {title && (
            <div className="text-sm font-bold text-blue-400/60 group-hover:text-blue-400 transition-colors tracking-tight">
              {title}
            </div>
          )}
        </div>
      </td>

      <td className="px-8 py-8">
        <div className="flex flex-col items-center gap-4 mx-auto w-[160px]">
          {previewUrl ? (
            <>
              <div
                className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/60 cursor-zoom-in group/img relative shadow-2xl transition-all hover:border-blue-500/50"
                onClick={() => window.open(file.image_url || previewUrl)}
              >
                <Image
                  src={previewUrl}
                  alt={file.name}
                  fill
                  sizes="160px"
                  className="object-contain transition-transform duration-700 group-hover/img:scale-110"
                />
              </div>
              <button
                onClick={() => file.image_url && onCopy(file.id, file.image_url, 'img')}
                className={`w-full py-3 rounded-xl font-black text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${
                  copyingId === `${file.id}-img`
                    ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                    : 'bg-white/5 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white active:scale-95'
                }`}
              >
                {copyingId === `${file.id}-img` ? <Check className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                COPY IMAGE URL
              </button>
            </>
          ) : (
            <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center bg-white/[0.02] opacity-20">
              <ImageIcon className="w-8 h-8" />
            </div>
          )}
        </div>
      </td>

      <td className="px-8 py-8">
        <div className="flex flex-col items-center gap-4 mx-auto w-[160px]">
          {file.audio_url ? (
            <>
              <div className="aspect-video flex items-center justify-center w-full">
                <button
                  onClick={() => window.open(file.audio_url!)}
                  className="w-14 h-14 bg-white/5 hover:bg-purple-600 text-purple-400 hover:text-white rounded-full transition-all flex items-center justify-center border border-purple-500/20 shadow-xl group/play hover:scale-110 active:scale-90"
                >
                  <Play className="w-6 h-6 transition-transform group-hover/play:scale-110" fill="currentColor" />
                </button>
              </div>
              <button
                onClick={() => onCopy(file.id, file.audio_url!, 'aud')}
                className={`w-full py-3 rounded-xl font-black text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${
                  copyingId === `${file.id}-aud`
                    ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                    : 'bg-white/5 text-purple-400 border border-purple-500/20 hover:bg-purple-600 hover:text-white active:scale-95'
                }`}
              >
                {copyingId === `${file.id}-aud` ? <Check className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                COPY AUDIO URL
              </button>
            </>
          ) : (
            <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center bg-white/[0.02] opacity-20">
              <Music className="w-6 h-6" />
            </div>
          )}
        </div>
      </td>

      <td className="px-8 py-8 text-right font-medium text-white/20 tabular-nums text-xs">
        {new Date(file.created_at).toLocaleDateString()}
      </td>
      <td className="px-8 py-8 text-right">
        <button
          onClick={() => onDelete(file.id, file.image_url, file.audio_url, file.thumb_url)}
          className="p-4 bg-red-500/5 text-red-500/40 hover:bg-red-500 hover:text-white rounded-2xl transition-all active:scale-90 group-hover:opacity-100 opacity-0"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </td>
    </tr>
  )
}
