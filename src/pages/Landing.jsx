import { useEffect, useRef } from 'react'
import './Landing.scss'
import { Coelbren, Awen, Weather } from '../components'
import { Link } from 'react-router'

const Landing = () => {
  const ref = useRef()

  useEffect(() => {
    const img = new window.Image()
    img.src = '/assets/images/druids_den_winter_snowman.jpg'
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
      <Link to='/what-to-expect' className='landing-cta'>
        Begin Your Northwoods Adventure &gt;
      </Link>
      <Link to='/spooktoberfest' className='landing-cta'>
        Spooktoberfest 2026 &gt;
      </Link>
      <Weather />
    </div>
  )
}

export default Landing
