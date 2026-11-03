import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { config } from 'dotenv'

const rootDir = process.cwd()
const envFiles = ['.env', '.env.local']

for (const file of envFiles) {
  const filePath = resolve(rootDir, file)
  if (existsSync(filePath)) {
    config({ path: filePath, override: true })
  }
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
