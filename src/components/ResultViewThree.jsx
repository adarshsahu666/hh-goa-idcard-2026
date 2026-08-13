import '../styles/result2.css'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { toBlob } from 'html-to-image'
import ShareSheet from './ShareSheet.jsx'
import templateSrc from '../assets/temp2.png'
import { downloadBlob, postToX, nativeShare, canUseNativeShare } from '../lib/shareUtils.js'

const FILENAME = 'hacker-house-goa-2026-builder-id-v2.png'
const CAPTION = "I'm building at Hacker House Goa 2026 🏝️ #FrameInGoa"

/**
 * ResultViewThree
 * Card layout is inspired by the temp2.png reference: one large
 * photo panel across the top, then two stacked value fields below
 * it (Name, Tech stack), and a builder-class footer. Unlike
 * ResultViewOne/temp1, this variant does NOT rely on the template
 * PNG already containing white boxes or asterisk accents — those
 * are drawn entirely in CSS (result2.css) so the card renders
 * correctly on top of any background art, including a plain
 * illustration with no baked-in UI chrome.
 *
 * Download/Share rasterize the live card DOM to a PNG via
 * html-to-image, then hand off to the same downloadBlob / postToX /
 * nativeShare helpers ResultView and ResultViewOne use.
 *
 * npm install html-to-image
 */
export default function ResultViewThree({
    photoUrl = null,
    name = '',
    techStack = '',
    builderClass = '',
    onStartOver,
}) {
    const cardRef = useRef(null)
    const photoImgRef = useRef(null)
    const workingRef = useRef(false)

    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isWorking, setIsWorking] = useState(false)
    const [actionError, setActionError] = useState(null)
    const [shareNotice, setShareNotice] = useState(null)

    // The card enters with a scale/rotate animation (see the <motion.div>
    // below). If Download/Share fires while that animation is still
    // in-flight, the card is captured at its transformed (smaller /
    // rotated) mid-animation size instead of its real, final size —
    // producing a downloaded image whose content is shifted/cropped
    // relative to what's on screen. Gate capture on the animation
    // actually finishing.
    const [isCardReady, setIsCardReady] = useState(false)

    const hasPhoto = Boolean(photoUrl)

    /**
     * Converts a blob: (or any same-origin) URL to a data: URL by fetching
     * it and reading it back as base64.
     */
    function urlToDataUrl(url) {
        return fetch(url)
            .then((res) => res.blob())
            .then(
                (blob) =>
                    new Promise((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onload = () => resolve(reader.result)
                        reader.onerror = () => reject(new Error('Could not read the photo file.'))
                        reader.readAsDataURL(blob)
                    }),
            )
    }

    /**
     * html-to-image needs to embed the photo's pixel data into the exported
     * PNG. The photo is normally shown via a blob: URL (from
     * URL.createObjectURL). Swapping it to a self-contained data: URL just
     * before capturing avoids network-fetch / CORS / cache-busting issues
     * that otherwise show up as a bare, unhelpful image-load failure.
     */
    async function withPhotoAsDataUrl(fn) {
        const img = photoImgRef.current
        const originalSrc = img?.getAttribute('src')
        const isBlob = originalSrc && originalSrc.startsWith('blob:')

        if (!img || !isBlob) {
            return fn()
        }

        try {
            const dataUrl = await urlToDataUrl(originalSrc)
            img.src = dataUrl
            if (img.decode) await img.decode()
            return await fn()
        } finally {
            if (originalSrc) img.src = originalSrc
        }
    }

    /**
     * Temporarily strips any inline transform (leftover framer-motion
     * scale/rotate values, or a mid-animation transform) from the *real*
     * DOM node for the duration of `fn`. Sizing is read from the live
     * node, so if it still has a transform applied when we measure it, we
     * capture the wrong box and the untransformed content overflows the
     * canvas — which is what was cropping/shifting the downloaded image.
     */
    async function withNeutralTransform(node, fn) {
        const previousTransform = node.style.transform
        const previousTransition = node.style.transition
        node.style.transition = 'none'
        node.style.transform = 'none'
        // Force layout so the browser actually applies the cleared
        // transform before we read any size from the node.
        // eslint-disable-next-line no-unused-expressions
        node.offsetHeight
        try {
            return await fn()
        } finally {
            node.style.transform = previousTransform
            node.style.transition = previousTransition
        }
    }

    /**
     * Turns whatever captureCard() might throw into a human-readable
     * message. html-to-image's internal image-loading can reject with a raw
     * DOM Event (e.g. an <img> onerror) rather than an Error — those don't
     * have a `.message`, so String(event) collapses to the useless
     * "[object Event]". This extracts something actually useful instead.
     */
    function describeCaptureError(err) {
        if (err instanceof Error && err.message) return err.message
        if (typeof err === 'string' && err) return err
        if (err && typeof err === 'object') {
            const failedSrc = err.target?.src || err.target?.currentSrc
            if (failedSrc) return `An image failed to load while exporting the card (${failedSrc}).`
            if (err.type) return `Unexpected "${err.type}" error while exporting the card.`
        }
        return 'Something went wrong exporting the card. Try again.'
    }

    /**
     * Waits for every <img> inside the card to be fully decoded before we
     * hand the DOM off to html-to-image. Without this, a snapshot taken
     * right after the photo/template <img> mounts can be captured before
     * the pixel data is actually painted, producing a blank or partial
     * image in the exported PNG — especially on slower devices.
     */
    async function waitForImagesToDecode(root) {
        const imgs = Array.from(root.querySelectorAll('img'))
        await Promise.all(
            imgs.map(async (img) => {
                try {
                    if (img.decode) {
                        await img.decode()
                    } else if (!img.complete) {
                        await new Promise((resolve) => {
                            img.onload = resolve
                            img.onerror = resolve
                        })
                    }
                } catch {
                    // decode() can reject for images that are still mid-load in
                    // some browsers; fall back to a plain load/error listener
                    // instead of failing the whole capture.
                    if (!img.complete) {
                        await new Promise((resolve) => {
                            img.onload = resolve
                            img.onerror = resolve
                        })
                    }
                }
            }),
        )
    }

    /**
     * Rejects with a clear error if `promise` doesn't settle within `ms`.
     * Without this, a stalled fetch inside html-to-image (e.g. trying to
     * download a @font-face file and never getting a response) leaves the
     * whole capture hanging forever — the button gets stuck on "Working…"
     * with no error and no way to recover except reloading the page.
     */
    function withTimeout(promise, ms, timeoutMessage) {
        let timer
        const timeout = new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error(timeoutMessage)), ms)
        })
        return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
    }

    async function captureCard() {
        if (!cardRef.current) throw new Error('Card is not ready yet.')
        if (!isCardReady) {
            throw new Error('Hang on — the card is still animating in. Try again in a moment.')
        }

        const node = cardRef.current

        try {
            return await withNeutralTransform(node, () =>
                withPhotoAsDataUrl(async () => {
                    await withTimeout(
                        waitForImagesToDecode(node),
                        8000,
                        'Timed out waiting for the card images to load. Try again.',
                    )

                    // offsetWidth/offsetHeight reflect the element's
                    // untransformed CSS layout box. Now that the transform has
                    // been neutralized above, this matches exactly what the
                    // clone renders at, so the canvas is sized correctly
                    // instead of coming out cropped or shifted.
                    const width = node.offsetWidth
                    const height = node.offsetHeight

                    if (!width || !height) {
                        throw new Error("Couldn't measure the card's size. Try again.")
                    }

                    const blob = await withTimeout(
                        toBlob(node, {
                            pixelRatio: 2,
                            cacheBust: false,
                            skipFonts: true,
                            // Pass the measured size explicitly so html-to-image
                            // doesn't have to recompute it inside the isolated
                            // SVG <foreignObject> it renders into (where CSS
                            // `aspect-ratio` on .idcard3 often doesn't resolve
                            // correctly on its own).
                            width,
                            height,
                            style: {
                                width: `${width}px`,
                                height: `${height}px`,
                                margin: '0',
                                transform: 'none',
                            },
                            // Note: `allowTaint` / `useCORS` are html2canvas
                            // options, not html-to-image ones — html-to-image
                            // was silently ignoring them. Cross-origin images
                            // are instead handled by swapping the photo <img>
                            // to a same-origin data: URL above.
                        }),
                        15000,
                        'Exporting the card took too long and was cancelled. Try again.',
                    )
                    if (!blob) throw new Error("Couldn't generate the card image (toBlob returned nothing). Try again.")
                    return blob
                }),
            )
        } catch (err) {
            console.error('Card capture error:', err)
            const message = describeCaptureError(err)
            throw err instanceof Error ? err : new Error(message)
        }
    }

    function runGuarded(fn) {
        if (workingRef.current) return
        workingRef.current = true
        setIsWorking(true)
        setActionError(null)
        return Promise.resolve()
            .then(fn)
            .catch((err) => {
                console.error('Download/Share failed:', err)
                setActionError(describeCaptureError(err))
            })
            .finally(() => {
                workingRef.current = false
                setIsWorking(false)
            })
    }

    function handleDownload() {
        runGuarded(async () => {
            const blob = await captureCard()
            downloadBlob(blob, FILENAME)
            setIsSheetOpen(false)
        })
    }

    function handlePostToX() {
        runGuarded(() => {
            postToX(window.location.href)
            setShareNotice(
                'Opened X with your caption and a link to the builder. Attach the image manually from Downloads or use Share to… if available.',
            )
            setIsSheetOpen(false)
        })
    }

    function handleNativeShare() {
        runGuarded(async () => {
            const blob = await captureCard()
            const outcome = await nativeShare(blob, FILENAME, CAPTION)
            if (outcome !== 'cancelled') {
                setIsSheetOpen(false)
            }
        })
    }

    const captureDisabled = isWorking || !isCardReady

    return (
        <div className="result-panel">
            <motion.p
                className="eyebrow"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
            >
                Task #1 · Done
            </motion.p>

            <motion.h2
                className="result-heading"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
            >
                Your Builder ID is ready
            </motion.h2>

            <motion.div
                className="idcard3"
                ref={cardRef}
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onAnimationComplete={() => setIsCardReady(true)}
            >
                <img
                    className="idcard3__template"
                    src={templateSrc}
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                />

                {/* Photo */}
                <div className="idcard3__photo">
                    {hasPhoto ? (
                        <img ref={photoImgRef} src={photoUrl} alt={name ? `${name}'s photo` : 'Builder photo'} />
                    ) : (
                        <div className="idcard3__photo-placeholder">
                            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                    d="M4 8a2 2 0 0 1 2-2h1.2a1 1 0 0 0 .8-.4l.9-1.2a1 1 0 0 1 .8-.4h4.6a1 1 0 0 1 .8.4l.9 1.2a1 1 0 0 0 .8.4H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinejoin="round"
                                />
                                <circle cx="12" cy="12.5" r="3.4" stroke="currentColor" strokeWidth="1.6" />
                            </svg>
                            <span>Your photo here</span>
                        </div>
                    )}
                </div>

                {/* Field 1: Name */}
                <span className="idcard3__asterisk idcard3__asterisk--1" aria-hidden="true">
                    ✳
                </span>
                <div className="idcard3__box idcard3__box--1">
                    <span className={`idcard3__value${name ? '' : ' idcard3__value--placeholder'}`}>
                        {name || 'Your name'}
                    </span>
                </div>

                {/* Field 2: Tech stack */}
                <span className="idcard3__asterisk idcard3__asterisk--2" aria-hidden="true">
                    ✳
                </span>
                <div className="idcard3__box idcard3__box--2">
                    <span className={`idcard3__value${techStack ? '' : ' idcard3__value--placeholder'}`}>
                        {techStack || 'e.g. React + Node'}
                    </span>
                </div>

                {/* Footer builder class label */}
                <span className={`idcard3__footer-label${builderClass ? '' : ' idcard3__footer-label--placeholder'}`}>
                    {builderClass || 'Builder class'}
                </span>
            </motion.div>

            <motion.p
                className="builder-class-tag"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
            >
                Builder class: {builderClass || '—'}
            </motion.p>

            <motion.div
                className="result-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.4 }}
            >
                <motion.button
                    type="button"
                    className="btn btn--primary"
                    onClick={handleDownload}
                    disabled={captureDisabled}
                    whileHover={captureDisabled ? {} : { scale: 1.02 }}
                    whileTap={captureDisabled ? {} : { scale: 0.97 }}
                >
                    {isWorking ? 'Working…' : isCardReady ? 'Download' : 'Preparing…'}
                </motion.button>

                <motion.button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => {
                        setActionError(null)
                        setShareNotice(null)
                        setIsSheetOpen(true)
                    }}
                    disabled={captureDisabled}
                    whileHover={captureDisabled ? {} : { scale: 1.02 }}
                    whileTap={captureDisabled ? {} : { scale: 0.97 }}
                >
                    Share your card
                </motion.button>
            </motion.div>

            {actionError && (
                <p className="form-error" role="alert">
                    {actionError}
                </p>
            )}

            {shareNotice && <p className="share-notice">{shareNotice}</p>}

            <motion.button
                type="button"
                className="btn-text"
                onClick={onStartOver}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
            >
                Make another
            </motion.button>

            <ShareSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onDownload={handleDownload}
                onPostToX={handlePostToX}
                onNativeShare={handleNativeShare}
                showNativeShare={canUseNativeShare()}
                disabled={isWorking}
            />
        </div>
    )
}