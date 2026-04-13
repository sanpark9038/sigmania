import { databases, storage, ID, Query, DB_ID, COLLECTION_ID, BUCKET_IMAGES, BUCKET_AUDIO, ENDPOINT, PROJECT_ID } from '@/lib/appwrite'
import { SigEntry } from '@/types'

const getPublicUrl = (bucketId: string, fileId: string) =>
  `${ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${PROJECT_ID}`

export const AssetService = {
  async fetchAll(): Promise<SigEntry[]> {
    const results: SigEntry[] = []
    let lastId: string | undefined = undefined
    const limit = 100

    while (true) {
      const queries = [Query.limit(limit)]
      if (lastId) queries.push(Query.cursorAfter(lastId))

      const res = await databases.listDocuments(DB_ID, COLLECTION_ID, queries)
      // Appwrite는 $id를 사용 → SigEntry의 id 필드로 매핑 (any 캐스팅으로 내부 필드 접근)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docs = res.documents.map((doc: any) => ({
        id: doc.$id as string,
        name: doc.name as string,
        image_url: (doc.image_url ?? null) as string | null,
        image_name: (doc.image_name ?? null) as string | null,
        audio_url: (doc.audio_url ?? null) as string | null,
        audio_name: (doc.audio_name ?? null) as string | null,
        created_at: doc.$createdAt as string,
      })) as SigEntry[]
      results.push(...docs)

      if (res.documents.length < limit) break
      lastId = res.documents[res.documents.length - 1].$id
    }

    return results
  },

  async delete(id: string, imageUrl: string | null, audioUrl: string | null) {
    // 스토리지에서 파일 삭제 (fileId를 URL에서 추출)
    if (imageUrl) {
      const fileId = imageUrl.split('/files/')[1]?.split('/')[0]
      if (fileId) {
        try { await storage.deleteFile(BUCKET_IMAGES, fileId) } catch {}
      }
    }
    if (audioUrl) {
      const fileId = audioUrl.split('/files/')[1]?.split('/')[0]
      if (fileId) {
        try { await storage.deleteFile(BUCKET_AUDIO, fileId) } catch {}
      }
    }
    await databases.deleteDocument(DB_ID, COLLECTION_ID, id)
  },

  async uploadFile(file: File, type: 'image' | 'audio', matchedName?: string) {
    const baseName = file.name.replace(/\.[^/.]+$/, '')
    const matchPrefix = matchedName || baseName.match(/^\d+/)?.[0] || baseName
    const bucketId = type === 'image' ? BUCKET_IMAGES : BUCKET_AUDIO

    // 파일 업로드
    const uploaded = await storage.createFile(bucketId, ID.unique(), file)
    const publicUrl = getPublicUrl(bucketId, uploaded.$id)

    // 기존 문서 조회
    const existing = await databases.listDocuments(DB_ID, COLLECTION_ID, [
      Query.equal('name', matchPrefix),
      Query.limit(1)
    ])

    if (existing.total > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = existing.documents[0] as any
      const docId = raw.$id as string
      const isImage = type === 'image'
      const existingUrl = (isImage ? raw.image_url : raw.audio_url) as string | null

      // 기존 파일 삭제
      if (existingUrl) {
        const oldFileId = existingUrl.split('/files/')[1]?.split('/')[0]
        if (oldFileId) {
          try { await storage.deleteFile(isImage ? BUCKET_IMAGES : BUCKET_AUDIO, oldFileId) } catch {}
        }
      }

      const updateData = isImage
        ? { image_url: publicUrl, image_name: file.name }
        : { audio_url: publicUrl, audio_name: file.name }

      await databases.updateDocument(DB_ID, COLLECTION_ID, docId, updateData)
    } else {
      await databases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), {
        name: matchPrefix,
        image_url: type === 'image' ? publicUrl : null,
        image_name: type === 'image' ? file.name : null,
        audio_url: type === 'audio' ? publicUrl : null,
        audio_name: type === 'audio' ? file.name : null,
      })
    }
  }
}
