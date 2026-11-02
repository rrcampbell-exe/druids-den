const bookingPlatforms = [
  {
    platform: 'Airbnb',
    variable: 'VITE_AIRBNB_BOOKING_URL',
    hostname: 'airbnb.com',
    value: import.meta.env.VITE_AIRBNB_BOOKING_URL,
  },
  {
    platform: 'Vrbo',
    variable: 'VITE_VRBO_BOOKING_URL',
    hostname: 'vrbo.com',
    value: import.meta.env.VITE_VRBO_BOOKING_URL,
  },
]

const getBookingLink = ({ platform, variable, hostname }, value) => {
  const normalizedValue = value?.trim()
  if (!normalizedValue) return null

  let url
  try {
    url = new URL(normalizedValue)
  } catch {
    throw new Error(`${variable} must be a valid HTTPS ${platform} listing URL`)
  }

  if (
    url.protocol !== 'https:' ||
    ![hostname, `www.${hostname}`].includes(url.hostname.toLowerCase()) ||
    url.username ||
    url.password
  ) {
    throw new Error(`${variable} must be a valid HTTPS ${platform} listing URL`)
  }

  return { platform, href: url.href }
}

export const bookingLinks = bookingPlatforms
  .map(({ value, ...platform }) => getBookingLink(platform, value))
  .filter(Boolean)
