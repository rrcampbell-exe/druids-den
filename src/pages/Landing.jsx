import '../App.css'
import { Link } from 'react-router'

const Landing = () =>
  <div className='landing-page'>
    <h1 className='landing-title'>
      <p className='the'>&#xE01B;&#xE027;&#xE033;</p>
      <p className='druids-den'>&#xE01F;&#xE026;&#xE03D;&#xE005;&#xE01F;&#xE03B; &#xE01F;&#xE033;&#xE021;</p>
      <p className='three-rays'>&#xE000;</p>
    </h1>
    <Link to='/spooktoberfest'>Spooktoberfest 2025 {'>'}</Link>
  </div>

export default Landing
