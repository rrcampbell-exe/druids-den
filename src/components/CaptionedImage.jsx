const CaptionedImage = ({ src, alt, className, style }) => {
  return (
    <figure className={`what-to-expect-image ${className || ''}`}>
      <img src={src} alt={alt} style={style} />
      <figcaption>{alt}</figcaption>
    </figure>
  )
}

export default CaptionedImage
