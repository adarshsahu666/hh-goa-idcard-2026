/**
 * Detects whether this code is running inside an embedded iframe (e.g. a
 * StackBlitz / CodeSandbox / Replit / bolt.new live-preview pane) rather
 * than as a normal top-level page.
 *
 * This matters because sandboxed preview iframes frequently block
 * programmatic file downloads and window.open() popups by default (their
 * `sandbox` attribute doesn't include `allow-downloads` / `allow-popups`).
 * When that happens, the click still "succeeds" from JS's point of view —
 * no exception is thrown — but the browser silently refuses to save the
 * file. That's indistinguishable from a bug unless you know to check for
 * it, so we detect it and use a fallback path instead.
 */
function isInsideIframe() {
  try {
    return typeof window !== 'undefined' && window.self !== window.top
  } catch {
    // Accessing window.top can throw a cross-origin SecurityError in some
    // sandboxes — if it does, we're definitely inside a restricted iframe.
    return true
  }
}

/**
 * Saves a blob as a real file download.
 *
 * In a normal top-level tab this is a synthetic same-origin anchor click —
 * no fetch, no CORS, nothing to go wrong the way a cross-origin `download`
 * attribute can.
 *
 * Inside a sandboxed preview iframe, the anchor click can be silently
 * ignored by the browser. As a fallback in that case, we also open the
 * image in a new tab so the user can still save it (right-click → Save
 * Image As, or long-press on mobile) even when the automatic download is
 * blocked.
 */
export function downloadBlob(blob, filename) {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  if (isInsideIframe()) {
    // Belt-and-suspenders: give the user a manual save path in case the
    // automatic download above was blocked by the embedding sandbox.
    window.open(objectUrl, '_blank', 'noopener')
  }

  setTimeout(() => URL.revokeObjectURL(objectUrl), 10000)
}

const TWEET_CAPTION = `🌴 Repping HH Goa 2026 with my new profile frame!
Excited to build, ship, and connect with amazing builders in Goa. 🚀
#FrameInGoa #HHGoa2026`

export function buildTweetIntentUrl({ shareUrl, caption = TWEET_CAPTION } = {}) {
  const params = new URLSearchParams({ text: caption })
  if (shareUrl) {
    params.set('url', shareUrl)
  }
  return `https://twitter.com/intent/tweet?${params.toString()}`
}

export function postToX(shareUrl) {
  const url = buildTweetIntentUrl({
    shareUrl: shareUrl ?? window.location.href,
  })
  const opened = window.open(url, '_blank', 'noopener')
  if (!opened && isInsideIframe()) {
    throw new Error(
      'The share popup was blocked by this preview environment. Open the app in its own browser tab and try again.',
    )
  }
}

/** Whether this browser exposes the Web Share API at all. */
export function canUseNativeShare() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

/**
 * Opens the native share sheet with the image file attached directly —
 * the person picks whatever app (X included) from their own device.
 * Throws if the browser can't share files (caller should check
 * `canUseNativeShare()` before offering this option, but browsers vary in
 * how precisely they support file-sharing, so this can still fail).
 */
export async function nativeShare(blob, filename, caption) {
  const file = new File([blob], filename, { type: 'image/png' })

  if (navigator.canShare && !navigator.canShare({ files: [file] })) {
    throw new Error('Sharing images isn\u2019t supported on this browser.')
  }

  try {
    await navigator.share({ files: [file], text: caption })
    return 'shared'
  } catch (err) {
    if (err.name === 'AbortError') return 'cancelled'
    throw err
  }
}