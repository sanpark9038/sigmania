export function getStorageObjectPath(publicUrl: string, bucket: string): string | null {
  try {
    const parsedUrl = new URL(publicUrl)
    const marker = `/storage/v1/object/public/${bucket}/`
    const markerIndex = parsedUrl.pathname.indexOf(marker)

    if (markerIndex === -1) {
      return null
    }

    return decodeURIComponent(parsedUrl.pathname.slice(markerIndex + marker.length))
  } catch {
    return null
  }
}
