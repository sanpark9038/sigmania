import { supabase } from '@/lib/supabase'

export const AssetService = {
  async fetchAll() {
    const { data, error } = await supabase
      .from('files')
      .select('*')
    if (error) throw error
    return data || []
  },

  async delete(id: string, imageUrl: string | null, audioUrl: string | null) {
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
  },

  async uploadFile(file: File, type: 'image' | 'audio', matchedName?: string) {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
    const baseName = file.name.replace(/\.[^/.]+$/, "") 
    const matchPrefix = matchedName || baseName.match(/^\d+/)?.[0] || baseName

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
      
      if (existingUrl) {
        // 교체 여부 확인은 UI단에서 먼저 처리하거나, 
        // 서비스단에서는 단순 덮어쓰기 로직만 수행
        const oldFileName = existingUrl.split('/').pop()
        if (oldFileName) {
          await supabase.storage.from(isImage ? 'images' : 'audio').remove([oldFileName])
        }
      }

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
}
