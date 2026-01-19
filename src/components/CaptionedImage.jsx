import { useEffect, useRef, useState } from 'react'

const CaptionedImage = ({ src, alt, className, style }) => {
  const [isVisible, setIsVisible] = useState(false)
  const figureRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1 // Trigger when 10% of the image is visible
      }
    )

    if (figureRef.current) {
      observer.observe(figureRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <figure 
      ref={figureRef}
      className={`what-to-expect-image ${className || ''} ${isVisible ? 'image-visible' : ''}`}
    >
      <img src={src} alt={alt} style={style} loading="lazy" />
      <figcaption>{alt}</figcaption>
    </figure>
  )
}

export default CaptionedImage
