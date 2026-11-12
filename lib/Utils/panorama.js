/**
 * Panorama Profile Picture Generator
 * Creates wide banner + square thumbnail for WhatsApp profile pictures
 * Optimized for Termux using pixcore (No sharp, no jimp)
 */

import { Boom } from '@hapi/boom'
import fs from 'fs'

const loadPixcore = async () => {
  try {
    
    const pixMod = await import('pixcore')
    return pixMod.default || pixMod
  } catch {
    throw new Boom('pixcore no está instalado. Por favor ejecuta: npm install pixcore')
  }
}

const bufferFromSource = async (mediaUpload) => {
  if (Buffer.isBuffer(mediaUpload)) return mediaUpload
  if ('url' in mediaUpload) {
    const urlStr = mediaUpload.url.toString()
    if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
      const response = await fetch(urlStr)
      return Buffer.from(await response.arrayBuffer())
    }
    return fs.readFileSync(urlStr)
  }
  if ('stream' in mediaUpload) {
    const chunks = []
    for await (const chunk of mediaUpload.stream) chunks.push(chunk)
    return Buffer.concat(chunks)
  }
  throw new Boom('Invalid media upload source')
}

export const generatePanoramaProfilePicture = async (mediaUpload, options) => {
  const { maxWidth = 720, quality = 80 } = options || {}
  const buffer = await bufferFromSource(mediaUpload)
  
  
  const pix = await loadPixcore()
  
  let img, fullImg

  try {
    
    const metadata = await (await pix.read(buffer)).metadata()
    const originalWidth = metadata.width || 640
    const originalHeight = metadata.height || 640
    const aspectRatio = originalWidth / originalHeight
    
    let newWidth = originalWidth
    let newHeight = originalHeight
    if (originalWidth > maxWidth) {
      newWidth = maxWidth
      newHeight = Math.round(maxWidth / aspectRatio)
    }

    
    fullImg = await (await pix.read(buffer))
      .resize(newWidth, newHeight, { fit: 'inside' })
      .jpeg({ quality })
      .toBuffer()

    
    img = await (await pix.read(buffer))
      .resize(640, 640, { fit: 'cover' })
      .jpeg({ quality: 50 })
      .toBuffer()

  } catch (error) {
    console.error("Error procesando imagen con pixcore:", error)
    throw new Boom(`Error al procesar la imagen de perfil: ${error.message}`)
  }

  return { img, fullImg }
}

export const updatePanoramaProfilePicture = async (sock, jid, content, options) => {
  const { img, fullImg } = await generatePanoramaProfilePicture(content, options)
  await sock.query({
    tag: 'iq',
    attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'w:profile:picture' },
    content: [
      { tag: 'picture', attrs: { type: 'image' }, content: img },
      { tag: 'picture', attrs: { type: 'fullsize' }, content: fullImg }
    ]
  })
}