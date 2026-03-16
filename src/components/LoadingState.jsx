import './LoadingState.scss'
import Flower from './Flower'
import Leaf from './Leaf'

const LoadingState = ({
  title = 'The Druids Den',
  message = 'Gathering what you need from the forest...',
  detail = 'This should only take a moment.',
}) => (
  <section className='loading-state' role='status' aria-live='polite' aria-busy='true'>
    <div className='loading-card'>
      <Flower />
      <h1>{title}</h1>
      <p className='loading-message'>{message}</p>
      <p className='loading-detail'>
        <span>{detail}</span>
      </p>
      <div className='loading-progress' aria-hidden='true'>
        <span className='loading-progress-sweep' />
      </div>
      <Leaf />
    </div>
  </section>
)

export default LoadingState
