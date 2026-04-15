'use client'

const THUMBNAIL_MAX_WIDTH = 320
const THUMBNAIL_QUALITY = 0.82

export async function createThumbnailFile(
  source: Blob,
  sourceName: string
): Promise<File> {
  const objectUrl = URL.createObjectURL(source)

  try {
    const image = await loadImage(objectUrl)
    const scale = Math.min(1, THUMBNAIL_MAX_WIDTH / image.naturalWidth)
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Canvas context is unavailable.')
    }

    context.drawImage(image, 0, 0, width, height)

    const thumbnailBlob = await canvasToBlob(canvas, 'image/webp', THUMBNAIL_QUALITY)
    const safeBaseName = sourceName.replace(/\.[^/.]+$/, '')

    return new File([thumbnailBlob], `${safeBaseName}.webp`, {
      type: 'image/webp',
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image for thumbnail generation.'))
    image.src = src
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create thumbnail blob.'))
        return
      }
      resolve(blob)
    }, type, quality)
  })
}
