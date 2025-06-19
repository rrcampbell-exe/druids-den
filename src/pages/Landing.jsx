import { useEffect, useRef } from 'react'
import '../App.css'
import { Link } from 'react-router'
import { Coelbren, Awen } from '../components'

const Landing = () => {
  const ref = useRef()

  useEffect(() => {
    const img = new window.Image()
    img.src = '/assets/images/druids_den_sky_image.jpg'
    img.onload = () => {
      if (ref.current) {
        ref.current.classList.add('image-loaded')
      }
    }
  }, [])

  return (
    <div className='landing-page' ref={ref}>
      <h1 className='landing-title'>
        <Coelbren className='the'>The</Coelbren>
        <Coelbren className='druids-den'>Druids Den</Coelbren>
        <p className='three-rays'><Awen /></p>
      </h1>
      <Link to='/spooktoberfest'>Spooktoberfest 2025 {'>'}</Link>
    </div>
  )
}

export default Landing
