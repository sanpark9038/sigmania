import { supabase } from '@/lib/supabase'
import { getStorageObjectPath } from '@/lib/storage'
import { createThumbnailFile } from '@/lib/thumbnail'

const FILES_SELECT = 'id,name,image_name,audio_name,image_url,thumb_url,audio_url,created_at'

export const AssetService = {
  async fetchAll() {
    const { data, error } = await supabase
      .from('files')
      .select(FILES_SELECT)

    if (error) throw error
    return data || []
  },

  async delete(id: string, imageUrl: string | null, audioUrl: string | null, thumbUrl?: string | null) {
    if (imageUrl) {
      const imagePath = getStorageObjectPath(imageUrl, 'images')
      if (imagePath) await supabase.storage.from('images').remove([imagePath])
    }

    if (thumbUrl) {
      const thumbPath = getStorageObjectPath(thumbUrl, 'images')
      if (thumbPath) await supabase.storage.from('images').remove([thumbPath])
    }

    if (audioUrl) {
      const audioPath = getStorageObjectPath(audioUrl, 'audio')
      if (audioPath) await supabase.storage.from('audio').remove([audioPath])
    }

    const { error } = await supabase.from('files').delete().eq('id', id)
    if (error) throw error
  },

  async uploadFile(file: File, type: 'image' | 'audio', matchedName?: string) {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
    const baseName = file.name.replace(/\.[^/.]+$/, '')
    const matchPrefix = matchedName || baseName.match(/^\d+/)?.[0] || baseName

    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const bucket = type === 'image' ? 'images' : 'audio'

    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file)
    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName)

    let thumbUrl: string | null = null
    if (type === 'image') {
      const thumbnailFile = await createThumbnailFile(file, file.name)
      const thumbPath = `thumbs/${Math.random().toString(36).substring(2)}-${Date.now()}.webp`
      const { error: thumbError } = await supabase.storage
        .from('images')
        .upload(thumbPath, thumbnailFile, { contentType: 'image/webp', upsert: false })

      if (thumbError) throw thumbError

      thumbUrl = supabase.storage.from('images').getPublicUrl(thumbPath).data.publicUrl
    }

    const { data: existing } = await supabase
      .from('files')
      .select('id,name,image_url,thumb_url,audio_url')
      .eq('name', matchPrefix)
      .single()

    if (existing) {
      const isImage = type === 'image'
      const existingUrl = isImage ? existing.image_url : existing.audio_url

      if (existingUrl) {
        const oldPath = getStorageObjectPath(existingUrl, isImage ? 'images' : 'audio')
        if (oldPath) {
          await supabase.storage.from(isImage ? 'images' : 'audio').remove([oldPath])
        }
      }

      if (isImage && existing.thumb_url) {
        const oldThumbPath = getStorageObjectPath(existing.thumb_url, 'images')
        if (oldThumbPath) {
          await supabase.storage.from('images').remove([oldThumbPath])
        }
      }

      const updateData = isImage
        ? { image_url: publicUrl, image_name: file.name, thumb_url: thumbUrl }
        : { audio_url: publicUrl, audio_name: file.name }

      await supabase.from('files').update(updateData).eq('id', existing.id)
    } else {
      await supabase.from('files').insert({
        name: matchPrefix,
        image_url: type === 'image' ? publicUrl : null,
        image_name: type === 'image' ? file.name : null,
        thumb_url: type === 'image' ? thumbUrl : null,
        audio_url: type === 'audio' ? publicUrl : null,
        audio_name: type === 'audio' ? file.name : null,
      })
    }
  },
}
