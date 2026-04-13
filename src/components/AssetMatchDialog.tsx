'use client'

import { useState, useEffect } from 'react'
import { Check, X, Info, AlertCircle, Music, Image as ImageIcon } from 'lucide-react'

interface PendingFile {
  id: string
  file: File
  type: 'image' | 'audio'
  suggestedName: string
  finalName: string
  isSet?: boolean
}

interface AssetMatchDialogProps {
  isOpen: boolean
  pendingFiles: PendingFile[]
  onConfirm: (finalFiles: PendingFile[]) => void
  onCancel: () => void
}

export function AssetMatchDialog({ isOpen, pendingFiles, onConfirm, onCancel }: AssetMatchDialogProps) {
  const [localFiles, setLocalFiles] = useState<PendingFile[]>(pendingFiles)

  // Update local state when pendingFiles prop changes (e.g. new upload scan)
  if (isOpen && localFiles !== pendingFiles && localFiles.length === 0 && pendingFiles.length > 0) {
    setLocalFiles(pendingFiles);
  }

  if (!isOpen) return null;

  const handleNameChange = (id: string, newName: string) => {
    setLocalFiles(prev => prev.map(f => f.id === id ? { ...f, finalName: newName } : f))
  }

  const handleToggleSet = (id: string) => {
    setLocalFiles(prev => prev.map(f => f.id === id ? { ...f, isSet: !f.isSet } : f))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#141415] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">지능형 자산 매칭</h2>
              <p className="text-xs text-white/40 font-medium">파일명에서 시그 번호를 확인하거나 직접 설정해주세요.</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-6 h-6 text-white/30" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-200/80 leading-relaxed font-medium">
              파일명에 명확한 숫자가 없습니다. <span className="text-amber-400 font-bold">시그 번호(1~30000)</span>를 입력해주세요. <br/>
              동일한 이름의 파일은 자동으로 한 세트로 묶입니다.
            </p>
          </div>

          <div className="space-y-3">
            {localFiles.map((pf) => (
              <div key={pf.id} className="group p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-5 transition-all hover:bg-white/[0.07] hover:border-white/10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${pf.type === 'image' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                  {pf.type === 'image' ? <ImageIcon className="w-6 h-6" /> : <Music className="w-6 h-6" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{pf.file.name}</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={pf.finalName}
                      onChange={(e) => handleNameChange(pf.id, e.target.value)}
                      placeholder="시그 번호 입력"
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-black text-white focus:outline-none focus:border-blue-500 transition-all w-32 text-center"
                    />
                    <span className="text-white/20 text-xs">번 시그로 설정</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleToggleSet(pf.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all border ${pf.isSet ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/10 text-white/40'}`}
                  >
                    {pf.isSet ? '세트 매칭됨' : '단독 파일'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-6 py-3 rounded-xl text-sm font-black text-white/40 hover:text-white/60 transition-colors"
          >
            취소
          </button>
          <button 
            onClick={() => onConfirm(localFiles)}
            className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>매칭 완료 및 업로드</span>
          </button>
        </div>
      </div>
    </div>
  )
}
