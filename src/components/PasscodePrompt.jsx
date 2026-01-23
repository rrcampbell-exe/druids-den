import { useState } from 'react'
import { Link } from 'react-router'
import './PasscodePrompt.scss'
import { Flower, Leaf, Awen } from './'

const PasscodePrompt = ({ onSuccess }) => {
  const [passcode, setPasscode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/verify-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passcode }),
      })

      const data = await response.json()

      if (data.success && data.token) {
        // Store the token in localStorage
        localStorage.setItem('spooktoberfest_auth', data.token)
        onSuccess()
      } else {
        setError('Invalid passcode. Please try again.')
        setPasscode('')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Passcode verification error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='passcode-prompt-page'>
      <div className='passcode-container'>
        <Flower />
        <h1>Spooktoberfest</h1>
        <p>This page is for invited guests only.</p>
        <p>Please enter the code from the back of your invitation.</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type='password'
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder='Enter passcode'
            disabled={isLoading}
            autoFocus
          />
          
          {error && <p className='error-message'>{error}</p>}
          
          <button type='submit' disabled={isLoading || !passcode}>
            {isLoading ? 'Verifying...' : 'Enter'}
          </button>
        </form>
        
        
        <Link to='/'>
          <div className='back-navigation'><Awen /> Go Back</div>
        </Link>
        <Leaf />
      </div>
    </div>
  )
}

export default PasscodePrompt
