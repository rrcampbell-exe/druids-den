// Load environment variables
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

module.exports = {
  datasource: {
    url: process.env.DEV_DATABASE_URL || process.env.DATABASE_URL
  }
}
