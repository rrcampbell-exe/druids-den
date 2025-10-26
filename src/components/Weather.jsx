import { useState, useEffect } from 'react'

const Weather = () => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Sign up at https://www.weatherapi.com/signup.aspx to get a free API key
        const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || 'demo_key'
        
        const query = 'Conover,WI'
        
        const response = await fetch(
          `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${query}&aqi=no`
        )
        
        if (!response.ok) {
          throw new Error('Weather data unavailable')
        }
        
        const data = await response.json()
        setWeather(data)
        // fade-in after data is loaded
        setTimeout(() => setIsVisible(true), 100)
      } catch (err) {
        setError(err.message)
        // Only show fallback data in development mode
        if (process.env.NODE_ENV === 'development') {
          setWeather({
            current: { 
              temp_f: 45,
              condition: { text: 'Partly Cloudy' }
            }
          })
          // fade-in for mock data too
          setTimeout(() => setIsVisible(true), 100)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  if (loading || !weather) {
    return null
  }

  // log error for debugging, but don't prevent display if we have weather data
  if (error) {
    console.warn('Weather API error:', error)
  }

  const temperature = Math.round(weather.current.temp_f)
  const condition = weather.current.condition.text

  return (
    <aside 
      className={`weather-widget ${isVisible ? 'weather-loaded' : ''}`}
      aria-label='Current weather for Conover, Wisconsin'
    >
      <header className='weather-location'>
        <h3>CONOVER, WI</h3>
      </header>
      <p className='weather-temp'>
        <span className='temperature-value'>{temperature}</span>
        <sup className='temperature-unit'>°F</sup>
      </p>
      <p className='weather-condition'>
        {condition.toUpperCase()}
      </p>
    </aside>
  )
}

export default Weather
