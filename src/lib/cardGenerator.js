import frameSrc from '../assets/card-frame.webp'
import { generateBuilderClass } from './builderClass.js'

// These match the frame-frame.webp pixel layout exactly — if the frame art
// ever changes, these are the numbers to update. (Verified by rendering a
// test composite before shipping — see project notes.)
const CANVAS_W = 1122
const CANVAS_H = 1402

const PHOTO_BOX = { x: 241, y: 440, w: 460, h: 460 }

const TEXT = {
  name: { x: 331, y: 985, fontSize: 30 },
  stackValue: { x: 331, y: 1086, fontSize: 24 },
  builderClassValue: { x: 331, y: 1176, fontSize: 24 },
}

const FONT_STACK = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

let frameImagePromise = null

function loadFrameImage() {
  if (!frameImagePromise) {
    frameImagePromise = loadImage(frameSrc)
  }
  return frameImagePromise
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load an image asset.'))
    img.src = src
  })
}

/**
 * Decodes the uploaded photo respecting its EXIF orientation (so phone
 * selfies don't come out sideways), without needing any manual EXIF
 * parsing — `imageOrientation: 'from-image'` handles it natively.
 * Falls back to a plain <img> for browsers without createImageBitmap.
 */
async function decodePhoto(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // fall through to the <img> fallback below
    }
  }
  const objectUrl = URL.createObjectURL(file)
  try {
    return await loadImage(objectUrl)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

/** Equivalent to CSS object-fit: cover — crops to the target aspect ratio, centered. */
function coverCropRect(sourceW, sourceH, targetW, targetH) {
  const targetRatio = targetW / targetH
  const sourceRatio = sourceW / sourceH

  let cropW, cropH
  if (sourceRatio > targetRatio) {
    cropH = sourceH
    cropW = Math.round(cropH * targetRatio)
  } else {
    cropW = sourceW
    cropH = Math.round(cropW / targetRatio)
  }

  return {
    sx: Math.round((sourceW - cropW) / 2),
    sy: Math.round((sourceH - cropH) / 2),
    sw: cropW,
    sh: cropH,
  }
}

/**
 * Generates the final Builder ID card entirely in the browser.
 * Returns { blob, previewUrl, builderClass } — no network round trip,
 * so this scales to as many concurrent people as can load the page;
 * there's no shared backend to fall over under load.
 */
export async function generateCard({ photoFile, name, stack }) {
  const [frame, photo] = await Promise.all([loadFrameImage(), decodePhoto(photoFile)])

  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H
  const ctx = canvas.getContext('2d')

  // 1. Photo, cropped to fill the cutout box (any aspect ratio "just works")
  const photoW = photo.width ?? photo.naturalWidth
  const photoH = photo.height ?? photo.naturalHeight
  const crop = coverCropRect(photoW, photoH, PHOTO_BOX.w, PHOTO_BOX.h)
  ctx.drawImage(
    photo,
    crop.sx, crop.sy, crop.sw, crop.sh,
    PHOTO_BOX.x, PHOTO_BOX.y, PHOTO_BOX.w, PHOTO_BOX.h,
  )
  photo.close?.()

  // 2. Frame art on top — its corners are pre-masked to round off the photo's
  //    square edges, and it carries the logo/header/barcode/row outlines/icons.
  ctx.drawImage(frame, 0, 0, CANVAS_W, CANVAS_H)

  // 3. Dynamic text
  const builderClass = generateBuilderClass(stack)
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#ffffff'

  ctx.font = `700 ${TEXT.name.fontSize}px ${FONT_STACK}`
  ctx.fillText(name, TEXT.name.x, TEXT.name.y)

  if (stack) {
    ctx.font = `700 ${TEXT.stackValue.fontSize}px ${FONT_STACK}`
    ctx.fillText(stack, TEXT.stackValue.x, TEXT.stackValue.y)
  }

  ctx.font = `700 ${TEXT.builderClassValue.fontSize}px ${FONT_STACK}`
  ctx.fillText(builderClass, TEXT.builderClassValue.x, TEXT.builderClassValue.y)

  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not export the card image.'))), 'image/png'),
  )

  return {
    blob,
    previewUrl: URL.createObjectURL(blob),
    builderClass,
  }
}
