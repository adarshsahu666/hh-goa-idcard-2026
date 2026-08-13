import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PhotoUpload from './components/PhotoUpload.jsx'
import ResultView from './components/ResultView.jsx'
import ResultViewOne from './components/ResultViewOne.jsx'
import ResultViewThree from './components/ResultViewThree.jsx'
import ResultViewFour from './components/ResultViewFour.jsx'
import Logo from './components/Logo.jsx'
import FrameSelector, { DEFAULT_FRAME_ID, getFrameById } from './components/FrameSelector.jsx'
import { DashedTrail, TechStackStrip, BeachFooter } from './components/Decorations.jsx'
import { generateCard } from './lib/cardGenerator.js'
import VideoBackground from './components/VideoBackground.jsx'
import videoBackgroundSrc from './assets/Create_a_smooth_cinematic_anim.mp4'

const STEP = {
  FORM: 'form',
  LOADING: 'loading',
  RESULT: 'result',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

const NAME_PATTERN = /^[A-Za-z0-9 .,'-]+$/
const STACK_PATTERN = /^[A-Za-z0-9 .,+/&-]+$/

const formVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.45 },
  },
}

export default function App() {
  const [step, setStep] = useState(STEP.FORM)
  const [photoFile, setPhotoFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [name, setName] = useState('')
  const [stack, setStack] = useState('')
  const [selectedFrameId, setSelectedFrameId] = useState(DEFAULT_FRAME_ID)
  const [result, setResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  // Guards against double-submits from fast double-taps/double-clicks on the
  // generate button — `disabled` alone can still race ahead of a state
  // update on a slow device, this ref can't.
  const isSubmittingRef = useRef(false)
  const resultRef = useRef(null)
  const shakeTimeoutRef = useRef(null)
  const [inputErrors, setInputErrors] = useState({ name: '', stack: '' })
  const [isShaking, setIsShaking] = useState(false)
  resultRef.current = result

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    // Revoke the generated card's object URL when the app unmounts (route
    // change, hot reload, etc.) — resetForm() handles the normal case.
    return () => {
      if (resultRef.current?.previewUrl) URL.revokeObjectURL(resultRef.current.previewUrl)
    }
  }, [])

  function validateName(value) {
    if (value.length < 2) {
      return 'Name must be at least 2 characters.'
    }
    if (value.length > 40) {
      return 'Name is too long; keep it under 40 characters.'
    }
    if (!NAME_PATTERN.test(value)) {
      return 'Name can only include letters, numbers, spaces, periods, commas, apostrophes, and hyphens.'
    }
    return ''
  }

  function validateStack(value) {
    if (!value) {
      return ''
    }
    if (value.length < 2) {
      return 'Tech stack entry is too short.'
    }
    if (value.length > 60) {
      return 'Tech stack is too long; keep it under 60 characters.'
    }
    if (!STACK_PATTERN.test(value)) {
      return 'Tech stack can only include letters, numbers, spaces, +, /, &, -, commas, and periods.'
    }
    return ''
  }

  function triggerShake() {
    setIsShaking(true)
    clearTimeout(shakeTimeoutRef.current)
    shakeTimeoutRef.current = setTimeout(() => {
      setIsShaking(false)
    }, 480)
  }

  function handleFileSelected(file) {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPhotoFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function resetForm() {
    if (result?.previewUrl) URL.revokeObjectURL(result.previewUrl)
    setStep(STEP.FORM)
    setResult(null)
    setErrorMessage(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMessage(null)
    setInputErrors({ name: '', stack: '' })

    if (isSubmittingRef.current) return

    if (!photoFile) {
      setErrorMessage('Add a photo first.')
      triggerShake()
      return
    }

    const trimmedName = name.trim()
    if (!trimmedName) {
      setErrorMessage('Add your name.')
      setInputErrors({ name: 'Add your name.', stack: '' })
      triggerShake()
      return
    }

    const nameError = validateName(trimmedName)
    if (nameError) {
      setErrorMessage(nameError)
      setInputErrors({ name: nameError, stack: '' })
      triggerShake()
      return
    }

    const stackError = validateStack(stack.trim())
    if (stackError) {
      setErrorMessage(stackError)
      setInputErrors({ name: '', stack: stackError })
      triggerShake()
      return
    }

    isSubmittingRef.current = true
    setStep(STEP.LOADING)

    try {
      const frame = getFrameById(selectedFrameId)
      const data = await generateCard({
        photoFile,
        name: name.trim(),
        stack: stack.trim(),
        frameId: frame.id,
        frameSrc: frame.src,
      })
      setResult(data)
      setStep(STEP.RESULT)
    } catch (err) {
      setErrorMessage(err.message || 'Could not generate the card. Try a different photo.')
      setStep(STEP.FORM)
    } finally {
      isSubmittingRef.current = false
    }
  }

  return (
    <>
      {/* Video background — unchanged */}
      <VideoBackground src={videoBackgroundSrc} />
      <div className="bg-video-overlay" aria-hidden="true" />

      <div className="page">
        <motion.header
          className="page-header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Logo />
          </motion.div>

          <motion.h1
            className="page-title"
            whileHover={{ scale: 1.02, rotate: 0.5 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          >
            Hacker House Goa 2026
            <br />
            Builder ID Generator
          </motion.h1>

          <p className="page-subtitle">
            Upload a photo, add your name and stack, get your card. Generated right in
            your browser — nothing uploaded anywhere.
          </p>
        </motion.header>

        <motion.main
          className="card"
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <DashedTrail className="card-trail" />
          <TechStackStrip />

          <AnimatePresence mode="wait">
            {step === STEP.RESULT && result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {selectedFrameId === 'frame1' ? (
                  <ResultViewOne
                    photoUrl={previewUrl}
                    name={name}
                    techStack={stack}
                    builderClass={result.builderClass}
                    onStartOver={resetForm}
                  />
                ) : selectedFrameId === 'frame2' ? (
                  <ResultView
                    photoUrl={previewUrl}
                    name={name}
                    techStack={stack}
                    builderClass={result.builderClass}
                    onStartOver={resetForm}
                  />
                ) : selectedFrameId === 'frame3' ? (
                  <ResultViewThree
                    photoUrl={previewUrl}
                    name={name}
                    techStack={stack}
                    builderClass={result.builderClass}
                    onStartOver={resetForm}
                  />
                ) : selectedFrameId === 'frame4' ? (
                  <ResultViewFour
                    photoUrl={previewUrl}
                    name={name}
                    techStack={stack}
                    builderClass={result.builderClass}
                    onStartOver={resetForm}
                  />
                ) : null}
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="form"
                onSubmit={handleSubmit}
                variants={formVariants}
                initial="hidden"
                animate={isShaking ? 'shake' : 'visible'}
                exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}
              >
                <motion.div variants={itemVariants}>
                  <FrameSelector
                    selectedFrameId={selectedFrameId}
                    onSelect={setSelectedFrameId}
                  />
                </motion.div>

                <div className="form-split">
                  <motion.div variants={itemVariants}>
                    <PhotoUpload
                      file={photoFile}
                      previewUrl={previewUrl}
                      onFileSelected={handleFileSelected}
                    />
                  </motion.div>

                  <div className="form-fields">
                    <motion.div className={`field ${inputErrors.name ? 'field--invalid' : ''}`} variants={itemVariants}>
                      <label htmlFor="name">Name</label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value)
                          if (inputErrors.name) {
                            setInputErrors((prev) => ({ ...prev, name: '' }))
                          }
                        }}
                        placeholder="Ju Hoon"
                        maxLength={40}
                        required
                        aria-invalid={!!inputErrors.name}
                      />
                      <span className="field-caption">Builder class · generated after submit</span>
                      {inputErrors.name && <span className="field-error-text">{inputErrors.name}</span>}
                    </motion.div>

                    <motion.div className={`field ${inputErrors.stack ? 'field--invalid' : ''}`} variants={itemVariants}>
                      <label htmlFor="stack">Tech / development stack</label>
                      <input
                        id="stack"
                        type="text"
                        value={stack}
                        onChange={(e) => {
                          setStack(e.target.value)
                          if (inputErrors.stack) {
                            setInputErrors((prev) => ({ ...prev, stack: '' }))
                          }
                        }}
                        placeholder="React + Spring Boot"
                        maxLength={60}
                        aria-invalid={!!inputErrors.stack}
                      />
                      {inputErrors.stack && <span className="field-error-text">{inputErrors.stack}</span>}
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {errorMessage && (
                    <motion.p
                      className="form-error"
                      role="alert"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto', x: [0, -6, 6, -4, 4, 0] }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {errorMessage}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  className="btn btn--primary btn--full"
                  disabled={step === STEP.LOADING}
                  variants={itemVariants}
                  whileHover={step !== STEP.LOADING ? { scale: 1.02 } : {}}
                  whileTap={step !== STEP.LOADING ? { scale: 0.97 } : {}}
                >
                  {step === STEP.LOADING ? (
                    <span className="btn-loading">
                      <motion.span
                        className="btn-loading-dot"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      />
                      Generating…
                    </span>
                  ) : (
                    'Generate ID card'
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <BeachFooter className="card-beach" />
        </motion.main>
      </div>
    </>
  )
}