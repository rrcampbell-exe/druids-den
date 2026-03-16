// Database utility - configured Prisma Client
// Import this in API routes and scripts instead of direct @prisma/client import

import { config } from 'dotenv'
import prismaPkg from '@prisma/client'

const { PrismaClient } = prismaPkg

// Load environment variables from .env.local (for Vercel Dev)
config({ path: '.env.local', override: true })

// In local/dev, prefer explicit DEV_* database vars when both are present.
if (process.env.DEV_DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = process.env.DEV_DATABASE_URL
}

if (process.env.DEV_PRISMA_DATABASE_URL?.trim()) {
  process.env.PRISMA_DATABASE_URL = process.env.DEV_PRISMA_DATABASE_URL
}

const accelerateUrl = process.env.PRISMA_DATABASE_URL

export const prisma = globalThis.prisma ?? new PrismaClient({
  accelerateUrl
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}
