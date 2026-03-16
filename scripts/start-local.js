import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { config } from 'dotenv'

const rootDir = process.cwd()
const envFiles = ['.env', '.env.local', '.env.clerk.local']

for (const file of envFiles) {
  const filePath = resolve(rootDir, file)
  if (existsSync(filePath)) {
    config({ path: filePath, override: true })
  }
}

const overrideMap = [
  ['VITE_LOCAL_CLERK_PUBLISHABLE_KEY', 'VITE_CLERK_PUBLISHABLE_KEY'],
  ['LOCAL_CLERK_SECRET_KEY', 'CLERK_SECRET_KEY'],
  ['LOCAL_CLERK_WEBHOOK_SIGNING_SECRET', 'CLERK_WEBHOOK_SIGNING_SECRET'],
  ['DEV_DATABASE_URL', 'DATABASE_URL'],
  ['DEV_PRISMA_DATABASE_URL', 'PRISMA_DATABASE_URL'],
]

const appliedOverrides = []

for (const [sourceKey, targetKey] of overrideMap) {
  const value = process.env[sourceKey]?.trim()
  if (!value) {
    continue
  }

  process.env[targetKey] = value
  appliedOverrides.push(`${sourceKey} -> ${targetKey}`)
}

if (appliedOverrides.length > 0) {
  console.log('Applying local environment overrides:')
  for (const override of appliedOverrides) {
    console.log(`- ${override}`)
  }
} else {
  console.log('No local Clerk overrides found. Using standard environment variables.')
  console.log('Add .env.clerk.local to override Clerk keys for localhost.')
}

const vercel = spawn('vercel', ['dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
})

vercel.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
