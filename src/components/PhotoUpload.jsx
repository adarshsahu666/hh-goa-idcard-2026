import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AsteriskAccent } from './Decorations.jsx'

export default function PhotoUpload({ file, previewUrl, onFileSelected }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = useCallback(
    (fileList) => {
      const picked = fileList?.[0]
      if (picked && picked.type.startsWith('image/')) {
        onFileSelected(picked)
      }
    },
    [onFileSelected],
  )

  return (
    <div className="photo-box-wrap">
      <AsteriskAccent className="photo-box-asterisk" />

      <motion.button
        type="button"
        className={`photo-box ${isDragging ? 'photo-box--dragging' : ''} ${file ? 'photo-box--filled' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        aria-label="Upload your photo"
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
        animate={isDragging ? { scale: 1.03 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        {previewUrl ? (
          <motion.img
            key={previewUrl}
            src={previewUrl}
            alt="Your selected photo"
            className="photo-box-img"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          />
        ) : (
          <span className="photo-box-placeholder">Photo</span>
        )}
      </motion.button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="upload-hint">{file ? file.name : 'Tap to upload, or drag a photo here'}</p>
    </div>
  )
}
