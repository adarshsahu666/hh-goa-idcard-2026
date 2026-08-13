import { useEffect, useRef, useState } from 'react'

export default function VideoBackground({ src }) {
    const videoRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const start = () => {
            video.currentTime = 0
            video.play().catch(() => { })
            setIsVisible(true)
        }

        if (video.readyState >= 2) {
            start()
        } else {
            video.addEventListener('loadeddata', start, { once: true })
        }

        return () => {
            video.removeEventListener('loadeddata', start)
        }
    }, [])

    return (
        <video
            ref={videoRef}
            className={`bg-video ${isVisible ? 'bg-video--visible' : ''}`}
            src={src}
            muted
            playsInline
            autoPlay
            preload="auto"
            loop
            aria-hidden="true"
        />
    )
}
