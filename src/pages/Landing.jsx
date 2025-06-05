import '../App.css'
import { Link } from 'react-router'
import Coelbren from '../components/Coelbren'

const Landing = () =>
  <div className='landing-page'>
    <h1 className='landing-title'>
      <Coelbren className='the' text='The' />
      <Coelbren className='druids-den' text='Druids Den' />
      <p className='three-rays'>&#xE000;</p>
    </h1>
    <Link to='/spooktoberfest'>Spooktoberfest 2025 {'>'}</Link>
  </div>

export default Landing
