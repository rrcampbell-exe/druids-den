// Seed script for The Druids Den database
// Generates realistic, date-relative test data

import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

import prismaPkg from '@prisma/client'
import { faker } from '@faker-js/faker'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { PrismaClient } = prismaPkg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const databaseUrl = process.env.DEV_DATABASE_URL || process.env.DATABASE_URL
const accelerateUrl = process.env.DEV_PRISMA_DATABASE_URL || process.env.PRISMA_DATABASE_URL

if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl
}

if (accelerateUrl) {
  process.env.PRISMA_DATABASE_URL = accelerateUrl
}

// Ensure DATABASE_URL is available
if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL environment variable is not set!')
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE')))
  process.exit(1)
}

console.log('Using DATABASE_URL from environment (value redacted)')

// Prisma 7 with Accelerate requires accelerateUrl in constructor
const prisma = new PrismaClient({
  accelerateUrl
})

// Helper to add days to a date
function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Generate a safe fake email using example.com (RFC 2606 reserved domain)
function generateSafeEmail() {
  const firstName = faker.person.firstName().toLowerCase()
  const lastName = faker.person.lastName().toLowerCase()
  const random = faker.number.int({ min: 10, max: 99 })
  return `${firstName}.${lastName}${random}@example.com`
}

// Generate fake Clerk ID
function generateFakeClerkId(index) {
  return `user_seed_${String(index).padStart(3, '0')}_${faker.string.alphanumeric(10)}`
}

// Check if dates conflict with existing reservations
function hasConflict(checkIn, checkOut, existingReservations) {
  return existingReservations.some(res => {
    const resCheckIn = new Date(res.checkIn)
    const resCheckOut = new Date(res.checkOut)
    
    // Check if the new dates overlap with existing reservation
    // Overlap occurs if: new check-in is before existing check-out AND new check-out is after existing check-in
    return checkIn < resCheckOut && checkOut > resCheckIn
  })
}

// Find next available check-in date after a given date
function findAvailableDate(startDate, nights, existingReservations, maxAttempts = 50) {
  let attempts = 0
  let checkIn = new Date(startDate)
  
  while (attempts < maxAttempts) {
    const checkOut = addDays(checkIn, nights)
    
    if (!hasConflict(checkIn, checkOut, existingReservations)) {
      return { checkIn, checkOut }
    }
    
    // Move to next day and try again
    checkIn = addDays(checkIn, 1)
    attempts++
  }
  
  // If no available date found, return null
  return null
}

// Group consecutive dates into ranges
function groupConsecutiveDates(dates) {
  if (dates.length === 0) return []
  
  const sorted = dates.sort()
  const ranges = []
  let rangeStart = sorted[0]
  let rangeEnd = sorted[0]
  
  for (let i = 1; i < sorted.length; i++) {
    const current = new Date(sorted[i])
    const previous = new Date(rangeEnd)
    const dayDiff = Math.floor((current - previous) / (1000 * 60 * 60 * 24))
    
    if (dayDiff === 1) {
      // Consecutive day
      rangeEnd = sorted[i]
    } else {
      // Gap found, save current range
      ranges.push({ startDate: rangeStart, endDate: rangeEnd })
      rangeStart = sorted[i]
      rangeEnd = sorted[i]
    }
  }
  
  // Don't forget the last range
  ranges.push({ startDate: rangeStart, endDate: rangeEnd })
  
  return ranges
}

async function main() {
  console.log('🌱 Starting database seed...')
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Create test users (guests)
  console.log('Creating test users...')
  const users = []
  for (let i = 1; i <= 15; i++) {
    const user = await prisma.user.create({
      data: {
        clerkId: generateFakeClerkId(i),
        email: generateSafeEmail(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number('(###) ###-####'),
        role: 'GUEST',
        marketingOptIn: faker.datatype.boolean(),
        preferredContactMethod: faker.helpers.arrayElement(['EMAIL', 'TEXT', 'BOTH']),
      },
    })
    users.push(user)
  }
  
  // Create admin/owner user
  const owner = await prisma.user.create({
    data: {
      clerkId: generateFakeClerkId(999),
      email: 'owner@example.com',
      firstName: 'Ryan',
      lastName: 'Campbell',
      phone: '(555) 123-4567',
      role: 'OWNER',
      marketingOptIn: false,
      preferredContactMethod: 'EMAIL',
    },
  })
  
  console.log(`✅ Created ${users.length + 1} users`)
  
  // Migrate blackout dates from JSON
  console.log('Migrating blackout dates from JSON...')
  const blackoutJsonPath = path.join(__dirname, '..', 'public', 'blackout-dates.json')
  const blackoutData = JSON.parse(fs.readFileSync(blackoutJsonPath, 'utf-8'))
  const blackoutRanges = groupConsecutiveDates(blackoutData.blackoutDates)
  
  for (const range of blackoutRanges) {
    await prisma.blackoutDate.create({
      data: {
        startDate: new Date(range.startDate),
        endDate: new Date(range.endDate),
        reason: 'Owner reservation',
        createdById: owner.id,
      },
    })
  }
  
  // Add some 2027 blackout dates
  const blackout2027 = [
    { start: '2027-01-15', end: '2027-01-18', reason: 'Maintenance' },
    { start: '2027-04-10', end: '2027-04-13', reason: 'Owner reservation' },
    { start: '2027-07-04', end: '2027-07-07', reason: 'Owner reservation' },
    { start: '2027-09-20', end: '2027-09-23', reason: 'Maintenance' },
    { start: '2027-12-24', end: '2027-12-28', reason: 'Owner reservation' },
  ]
  
  for (const blackout of blackout2027) {
    await prisma.blackoutDate.create({
      data: {
        startDate: new Date(blackout.start),
        endDate: new Date(blackout.end),
        reason: blackout.reason,
        createdById: owner.id,
      },
    })
  }
  
  console.log(`✅ Created ${blackoutRanges.length + blackout2027.length} blackout date ranges`)
  
  // Create reservations
  console.log('Creating reservations...')
  const reservations = []
  
  // Past reservations (6 months ago to 1 week ago) - COMPLETED
  for (let i = 0; i < 10; i++) {
    const daysAgo = faker.number.int({ min: 7, max: 180 })
    const nights = faker.number.int({ min: 2, max: 5 })
    const targetDate = addDays(today, -daysAgo)
    
    const dates = findAvailableDate(targetDate, nights, reservations)
    if (!dates) {
      console.log(`⚠️  Skipping past reservation ${i + 1} - no available dates`)
      continue
    }
    
    const user = faker.helpers.arrayElement(users)
    
    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        guestFirstName: user.firstName,
        guestLastName: user.lastName,
        guestEmail: user.email,
        guestPhone: user.phone,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        adults: faker.number.int({ min: 1, max: 4 }),
        children: faker.number.int({ min: 0, max: 3 }),
        specialRequests: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
        status: 'COMPLETED',
        statusChangedAt: addDays(dates.checkIn, -7),
        statusChangedById: owner.id,
        isOwnerReservation: false,
        submittedAt: addDays(dates.checkIn, -14),
      },
    })
    reservations.push(reservation)
    
    // Add feedback for some completed reservations
    if (faker.datatype.boolean(0.6)) {
      await prisma.feedback.create({
        data: {
          reservationId: reservation.id,
          userId: user.id,
          rating: faker.number.int({ min: 4, max: 5 }),
          review: faker.lorem.paragraph(),
          wouldRecommend: true,
          isPublic: faker.datatype.boolean(0.8),
          submittedAt: addDays(dates.checkOut, faker.number.int({ min: 1, max: 5 })),
        },
      })
    }
  }
  
  // Past denied reservations (2-3)
  for (let i = 0; i < 2; i++) {
    const daysAgo = faker.number.int({ min: 30, max: 120 })
    const nights = faker.number.int({ min: 2, max: 4 })
    const targetDate = addDays(today, -daysAgo)
    
    const dates = findAvailableDate(targetDate, nights, reservations)
    if (!dates) {
      console.log(`⚠️  Skipping denied reservation ${i + 1} - no available dates`)
      continue
    }
    
    const user = faker.helpers.arrayElement(users)
    
    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        guestFirstName: user.firstName,
        guestLastName: user.lastName,
        guestEmail: user.email,
        guestPhone: user.phone,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        adults: faker.number.int({ min: 1, max: 4 }),
        children: faker.number.int({ min: 0, max: 2 }),
        specialRequests: faker.lorem.sentence(),
        status: 'DENIED',
        denialMessage: 'Unfortunately, we had a scheduling conflict for those dates.',
        statusChangedAt: addDays(dates.checkIn, -10),
        statusChangedById: owner.id,
        isOwnerReservation: false,
        submittedAt: addDays(dates.checkIn, -15),
      },
    })
    reservations.push(reservation)
  }
  
  // Past cancelled reservations (1-2)
  for (let i = 0; i < 2; i++) {
    const daysAgo = faker.number.int({ min: 14, max: 90 })
    const nights = faker.number.int({ min: 2, max: 4 })
    const targetDate = addDays(today, -daysAgo)
    
    const dates = findAvailableDate(targetDate, nights, reservations)
    if (!dates) {
      console.log(`⚠️  Skipping cancelled reservation ${i + 1} - no available dates`)
      continue
    }
    
    const user = faker.helpers.arrayElement(users)
    
    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        guestFirstName: user.firstName,
        guestLastName: user.lastName,
        guestEmail: user.email,
        guestPhone: user.phone,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        adults: faker.number.int({ min: 1, max: 4 }),
        children: faker.number.int({ min: 0, max: 2 }),
        specialRequests: null,
        status: 'CANCELLED',
        cancellationMessage: 'Guest requested cancellation due to change in plans.',
        statusChangedAt: addDays(dates.checkIn, -5),
        statusChangedById: owner.id,
        isOwnerReservation: false,
        submittedAt: addDays(dates.checkIn, -20),
      },
    })
    reservations.push(reservation)
  }
  
  // Pending reservations (next 2-8 weeks) - need approval
  for (let i = 0; i < 4; i++) {
    const daysAhead = faker.number.int({ min: 14, max: 56 })
    const nights = faker.number.int({ min: 2, max: 5 })
    const targetDate = addDays(today, daysAhead)
    
    const dates = findAvailableDate(targetDate, nights, reservations)
    if (!dates) {
      console.log(`⚠️  Skipping pending reservation ${i + 1} - no available dates`)
      continue
    }
    
    const user = faker.helpers.arrayElement(users)
    
    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        guestFirstName: user.firstName,
        guestLastName: user.lastName,
        guestEmail: user.email,
        guestPhone: user.phone,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        adults: faker.number.int({ min: 1, max: 6 }),
        children: faker.number.int({ min: 0, max: 3 }),
        specialRequests: faker.datatype.boolean(0.5) ? faker.lorem.sentence() : null,
        status: 'PENDING',
        isOwnerReservation: false,
        submittedAt: addDays(today, -faker.number.int({ min: 1, max: 5 })),
      },
    })
    reservations.push(reservation)
  }
  
  // Approved reservations (near-term: next 2-6 weeks)
  for (let i = 0; i < 3; i++) {
    const daysAhead = faker.number.int({ min: 10, max: 42 })
    const nights = faker.number.int({ min: 2, max: 5 })
    const targetDate = addDays(today, daysAhead)
    
    const dates = findAvailableDate(targetDate, nights, reservations)
    if (!dates) {
      console.log(`⚠️  Skipping near-term reservation ${i + 1} - no available dates`)
      continue
    }
    
    const user = faker.helpers.arrayElement(users)
    
    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        guestFirstName: user.firstName,
        guestLastName: user.lastName,
        guestEmail: user.email,
        guestPhone: user.phone,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        adults: faker.number.int({ min: 1, max: 4 }),
        children: faker.number.int({ min: 0, max: 3 }),
        specialRequests: faker.datatype.boolean(0.4) ? faker.lorem.sentence() : null,
        status: 'APPROVED',
        statusChangedAt: addDays(today, -faker.number.int({ min: 1, max: 7 })),
        statusChangedById: owner.id,
        isOwnerReservation: false,
        submittedAt: addDays(today, -faker.number.int({ min: 7, max: 14 })),
      },
    })
    reservations.push(reservation)
  }
  
  // Future approved reservations (2-6 months out)
  for (let i = 0; i < 6; i++) {
    const daysAhead = faker.number.int({ min: 60, max: 180 })
    const nights = faker.number.int({ min: 2, max: 5 })
    const targetDate = addDays(today, daysAhead)
    
    const dates = findAvailableDate(targetDate, nights, reservations)
    if (!dates) {
      console.log(`⚠️  Skipping future reservation ${i + 1} - no available dates`)
      continue
    }
    
    const user = faker.helpers.arrayElement(users)
    
    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        guestFirstName: user.firstName,
        guestLastName: user.lastName,
        guestEmail: user.email,
        guestPhone: user.phone,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        adults: faker.number.int({ min: 1, max: 6 }),
        children: faker.number.int({ min: 0, max: 4 }),
        specialRequests: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
        status: 'APPROVED',
        statusChangedAt: addDays(today, -faker.number.int({ min: 14, max: 30 })),
        statusChangedById: owner.id,
        isOwnerReservation: false,
        submittedAt: addDays(today, -faker.number.int({ min: 20, max: 45 })),
      },
    })
    reservations.push(reservation)
  }
  
  // Owner reservations (scattered in future)
  const ownerReservationDates = [30, 75, 120, 160]
  for (const daysAhead of ownerReservationDates) {
    const nights = faker.number.int({ min: 3, max: 7 })
    const targetDate = addDays(today, daysAhead)
    
    const dates = findAvailableDate(targetDate, nights, reservations)
    if (!dates) {
      console.log(`⚠️  Skipping owner reservation at day ${daysAhead} - no available dates`)
      continue
    }
    
    const reservation = await prisma.reservation.create({
      data: {
        userId: owner.id,
        guestFirstName: owner.firstName,
        guestLastName: owner.lastName,
        guestEmail: owner.email,
        guestPhone: owner.phone,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        adults: faker.number.int({ min: 2, max: 4 }),
        children: faker.number.int({ min: 0, max: 2 }),
        specialRequests: null,
        status: 'APPROVED',
        isOwnerReservation: true,
        ownerNotes: faker.helpers.arrayElement([
          'Personal vacation',
          'Family gathering',
          'Friends visit',
          'Holiday stay',
        ]),
        statusChangedAt: addDays(today, -faker.number.int({ min: 1, max: 3 })),
        statusChangedById: owner.id,
        submittedAt: addDays(today, -faker.number.int({ min: 1, max: 5 })),
      },
    })
    reservations.push(reservation)
  }
  
  console.log(`✅ Created ${reservations.length} reservations across various statuses and time periods`)
  
  console.log('\n🎉 Database seeded successfully!')
  console.log('\nSummary:')
  console.log(`  • ${users.length + 1} users (${users.length} guests + 1 owner)`)
  console.log(`  • ${blackoutRanges.length + blackout2027.length} blackout date ranges`)
  console.log(`  • ${reservations.length} reservations:`)
  console.log(`    - 10 completed (past)`)
  console.log(`    - 2 denied (past)`)
  console.log(`    - 2 cancelled (past)`)
  console.log(`    - 4 pending (need approval)`)
  console.log(`    - 3 approved (near-term)`)
  console.log(`    - 6 approved (future)`)
  console.log(`    - 4 owner reservations (future)`)
  console.log(`  • ~6 feedback entries`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
