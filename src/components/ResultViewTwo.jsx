import '../styles/result0.css'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { toBlob } from 'html-to-image'
import ShareSheet from './ShareSheet.jsx'
import templateSrc from '../assets/temp4.png'
import { downloadBlob, postToX, nativeShare, canUseNativeShare } from '../lib/shareUtils.js'

const FILENAME = 'hacker-house-goa-2026-builder-id-v4.png'
const CAPTION = "I'm building at Hacker House Goa 2026 🏝️ #FrameInGoa"

/**
 * ResultViewTwo
 * Card layout matches the temp4.png reference: a square rounded
 * photo panel near the top, then three stacked field rows below it
 * — a pink chip with a person icon for Name, a dark-green chip
 * with a "</>" icon for Tech stack, and a gold chip with a hard-hat
 * icon for Builder class. As with idcard3/idcard4, none of this
 * assumes the template PNG already contains the chips or input
 * pills; they're drawn entirely in CSS (result0.css) so the card
 * renders correctly no matter what the background art underneath
 * actually contains.
 *
 * Each field shows its own uppercase label ("NAME", "TECH STACK",
 * "BUILDER CLASS") as a placeholder — matching the reference art —
 * until the user's actual value is provided, at which point the
 * value replaces it.
 *
 * Download/Share rasterize the live card DOM to a PNG via
 * html-to-image, then hand off to the same downloadBlob / postToX /
 * nativeShare helpers the other ResultView variants use.
 *
 * npm install html-to-image
 */
export default function ResultViewTwo({
  photoUrl = null,
  name = '',
  techStack = '',
  builderClass = '',
  onStartOver,
}) {
  const cardRef = useRef(null)
  const workingRef = useRef(false)

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [shareNotice, setShareNotice] = useState(null)

  const hasPhoto = Boolean(photoUrl)

  async function captureCard() {
    if (!cardRef.current) throw new Error('Card is not ready yet.')
    const blob = await toBlob(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
    })
    if (!blob) throw new Error("Couldn't generate the card image. Try again.")
    return blob
  }

  function runGuarded(fn) {
    if (workingRef.current) return
    workingRef.current = true
    setIsWorking(true)
    setActionError(null)
    return Promise.resolve()
      .then(fn)
      .catch((err) => setActionError(err.message))
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
        className="idcard0"
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          className="idcard0__template"
          src={templateSrc}
          alt=""
          aria-hidden="true"
          draggable="false"
          crossOrigin="anonymous"
        />

        {/* Photo — square rounded panel */}
        <div className="idcard0__photo">
          {hasPhoto ? (
            <img src={photoUrl} alt={name ? `${name}'s photo` : 'Builder photo'} crossOrigin="anonymous" />
          ) : (
            <div className="idcard0__photo-placeholder">
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

        {/* Field 1: Name — pink chip + person icon */}
        <div className="idcard0__field idcard0__field--1">
          <span className="idcard0__field-icon idcard0__field-icon--pink" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.6" fill="currentColor" />
              <path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="idcard0__field-divider" aria-hidden="true" />
          <span className="idcard0__value">{name || 'NAME'}</span>
        </div>

        {/* Field 2: Tech stack — dark-green chip + code icon */}
        <div className="idcard0__field idcard0__field--2">
          <span className="idcard0__field-icon idcard0__field-icon--forest" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6 3.5 12 9 18M15 6l5.5 6-5.5 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="idcard0__field-divider" aria-hidden="true" />
          <span className="idcard0__value">{techStack || 'TECH STACK'}</span>
        </div>

        {/* Field 3: Builder class — gold chip + hard-hat icon */}
        <div className="idcard0__field idcard0__field--3">
          <span className="idcard0__field-icon idcard0__field-icon--gold" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 15.5a8 8 0 0 1 16 0"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
              />
              <path d="M11.1 6.6V9" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
              <rect x="3" y="15.5" width="18" height="2.6" rx="1.3" fill="currentColor" />
            </svg>
          </span>
          <span className="idcard0__field-divider" aria-hidden="true" />
          <span className="idcard0__value">{builderClass || 'BUILDER CLASS'}</span>
        </div>
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
          disabled={isWorking}
          whileHover={isWorking ? {} : { scale: 1.02 }}
          whileTap={isWorking ? {} : { scale: 0.97 }}
        >
          {isWorking ? 'Working…' : 'Download'}
        </motion.button>

        <motion.button
          type="button"
          className="btn btn--outline"
          onClick={() => {
            setActionError(null)
            setShareNotice(null)
            setIsSheetOpen(true)
          }}
          disabled={isWorking}
          whileHover={isWorking ? {} : { scale: 1.02 }}
          whileTap={isWorking ? {} : { scale: 0.97 }}
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