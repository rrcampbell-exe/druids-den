import { execSync } from 'node:child_process'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.test', override: false })
loadEnv({ path: '.env.local', override: false })
loadEnv({ path: '.env', override: false })

export default async function globalSetup() {
  if (process.env.PLAYWRIGHT_SKIP_DB_SETUP === 'true') {
    console.log('Skipping Playwright database setup because PLAYWRIGHT_SKIP_DB_SETUP=true')
    return
  }

  if (!process.env.DATABASE_URL) {
    console.warn('Skipping Playwright database setup because DATABASE_URL is not configured.')
    return
  }

  execSync('npm run db:deploy', {
    stdio: 'inherit',
    env: process.env,
  })

  if (process.env.PLAYWRIGHT_SKIP_DB_SEED === 'true') {
    console.log('Skipping Playwright seed because PLAYWRIGHT_SKIP_DB_SEED=true')
    return
  }

  execSync('npm run db:seed', {
    stdio: 'inherit',
    env: process.env,
  })
}
