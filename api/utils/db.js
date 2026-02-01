// Database utility - configured Prisma Client
// Import this in API routes and scripts instead of direct @prisma/client import

import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables from .env.local (for Vercel Dev)
config({ path: '.env.local' })

export const prisma = globalThis.prisma ?? new PrismaClient({
  accelerateUrl: process.env.PRISMA_DATABASE_URL
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}
