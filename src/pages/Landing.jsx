import { useEffect, useRef } from 'react'
import '../App.css'
import { Coelbren, Awen, Weather } from '../components'

const Landing = () => {
  const ref = useRef()

  useEffect(() => {
    const img = new window.Image()
    img.src = '/assets/images/druids_den_autumn_evening_fire_pit.jpg'
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
      <Weather />
    </div>
  )
}

export default Landing
