export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { passcode, page } = req.body

  if (page !== 'spooktoberfest') {
    return res.status(400).json({ error: 'Passcode auth is only available for Spooktoberfest' })
  }
  
  const correctPasscode = process.env.SPOOKTOBERFEST_PASSCODE
  
  // Check if environment variable is set
  if (!correctPasscode) {
    console.error(`${page.toUpperCase()}_PASSCODE environment variable is not set`)
    return res.status(500).json({ error: 'Server configuration error' })
  }

  // Validate passcode
  if (passcode === correctPasscode) {
    // Generate a simple session token (timestamp-based for basic validation)
    const token = Buffer.from(
      JSON.stringify({ 
        authenticated: true, 
        timestamp: Date.now(),
        page 
      })
    ).toString('base64')

    return res.status(200).json({ 
      success: true, 
      token 
    })
  }

  // Invalid passcode
  return res.status(401).json({ 
    success: false, 
    error: 'Invalid passcode' 
  })
}
