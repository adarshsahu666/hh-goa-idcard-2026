import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.2l-5.6-7.3L4 22H1l8.1-9.3L1 2h7.4l5.1 6.7L18.9 2Zm-1.3 18h1.9L7.5 4h-2l12.1 16Z" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M8.2 10.8 15.8 6.2M8.2 13.2l7.6 4.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function ShareSheet({ isOpen, onClose, onDownload, onPostToX, onNativeShare, showNativeShare, disabled }) {
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const options = [
    { key: 'x', label: 'Post on X', hint: 'Open X with a ready caption and link', icon: <XIcon />, onClick: onPostToX },
  ]
  if (showNativeShare) {
    options.push({
      key: 'share',
      label: 'Share to\u2026',
      hint: 'Use your device\u2019s share sheet',
      icon: <ShareIcon />,
      onClick: onNativeShare,
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="share-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="share-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Share your Builder ID"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="share-sheet-title">Share your card</p>

            <div className="share-sheet-options">
              {options.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className="share-sheet-option"
                  onClick={opt.onClick}
                  disabled={disabled}
                >
                  <span className="share-sheet-option-icon">{opt.icon}</span>
                  <span className="share-sheet-option-text">
                    <span className="share-sheet-option-label">{opt.label}</span>
                    <span className="share-sheet-option-hint">{opt.hint}</span>
                  </span>
                </button>
              ))}
            </div>

            <button type="button" className="btn-text" onClick={onClose}>
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
