import { motion } from 'framer-motion'
import frame1 from '../assets/frame1.jpeg'
import frame2 from '../assets/frame2.jpeg'
import frame3 from '../assets/frame3.jpeg'
import frame4 from '../assets/frame4.jpeg'

// Central list of available frames. Add more entries here as you drop new
// frame images into src/assets — the grid and cardGenerator both read from
// this single source of truth.
export const FRAMES = [
  { id: 'frame1', label: 'Frame 1', thumbnail: frame1, src: frame1 },
  { id: 'frame2', label: 'Frame 2', thumbnail: frame2, src: frame2 },
  { id: 'frame3', label: 'Frame 3', thumbnail: frame3, src: frame3 },
  { id: 'frame4', label: 'Frame 4', thumbnail: frame4, src: frame4 },
]

export const DEFAULT_FRAME_ID = FRAMES[0].id

export function getFrameById(id) {
  return FRAMES.find((f) => f.id === id) || FRAMES[0]
}

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const optionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
}

export default function FrameSelector({ selectedFrameId, onSelect, frames = FRAMES }) {
  return (
    <div className="frame-selector">
      <div className="frame-selector-header">
        <span className="frame-selector-icon" aria-hidden="true">
          🖼
        </span>
        <span>Choose your frame</span>
      </div>

      <motion.div
        className="frame-selector-grid"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        role="radiogroup"
        aria-label="Choose your frame"
      >
        {frames.map((frame) => {
          const isSelected = frame.id === selectedFrameId
          return (
            <motion.button
              type="button"
              key={frame.id}
              className={`frame-option ${isSelected ? 'frame-option--selected' : ''}`}
              onClick={() => onSelect(frame.id)}
              variants={optionVariants}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              role="radio"
              aria-checked={isSelected}
            >
              <span className="frame-option-thumb-wrap">
                <img src={frame.thumbnail} alt="" className="frame-option-thumb" />
                {isSelected && (
                  <motion.span
                    className="frame-option-check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    ✓
                  </motion.span>
                )}
              </span>
              <span className="frame-option-label">{frame.label}</span>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}