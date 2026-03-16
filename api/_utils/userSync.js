import { prisma } from './db.js'

const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase() || null

const getPrimaryEmail = (userData) => {
  const primaryEmailId = userData.primaryEmailAddressId || userData.primary_email_address_id
  const emailAddresses = userData.emailAddresses || userData.email_addresses || []

  const primaryEmail = emailAddresses.find((entry) => {
    const entryId = entry.id || entry.email_address_id
    return entryId === primaryEmailId
  })

  return (
    primaryEmail?.emailAddress ||
    primaryEmail?.email_address ||
    emailAddresses[0]?.emailAddress ||
    emailAddresses[0]?.email_address ||
    userData.email ||
    null
  )
}

const getPrimaryPhone = (userData) => {
  const primaryPhoneId = userData.primaryPhoneNumberId || userData.primary_phone_number_id
  const phoneNumbers = userData.phoneNumbers || userData.phone_numbers || []

  const primaryPhone = phoneNumbers.find((entry) => entry.id === primaryPhoneId)

  return primaryPhone?.phoneNumber || primaryPhone?.phone_number || phoneNumbers[0]?.phoneNumber || phoneNumbers[0]?.phone_number || null
}

export function normalizeClerkUser(userData) {
  const clerkId = userData.id
  const email = getPrimaryEmail(userData)?.toLowerCase() || null

  if (!clerkId || !email) {
    throw new Error('Clerk user payload is missing an id or primary email address')
  }

  return {
    clerkId,
    email,
    firstName: userData.firstName || userData.first_name || null,
    lastName: userData.lastName || userData.last_name || null,
    phone: getPrimaryPhone(userData),
  }
}

export async function upsertClerkUser(userData) {
  const normalized = normalizeClerkUser(userData)
  const existingUserByClerkId = await prisma.user.findUnique({
    where: {
      clerkId: normalized.clerkId,
    },
  })

  const existingUserByEmail = existingUserByClerkId
    ? null
    : await prisma.user.findUnique({
      where: {
        email: normalized.email,
      },
    })

  const existingUser = existingUserByClerkId || existingUserByEmail

  const isOwner = ownerEmail && normalized.email === ownerEmail
  const nextRole = isOwner ? 'OWNER' : existingUser?.role || 'GUEST'
  const nextAccountStatus = isOwner ? 'APPROVED' : existingUser?.accountStatus || 'PENDING_APPROVAL'
  const nextStatusChangedAt = isOwner
    ? existingUser?.accountStatusChangedAt || new Date()
    : existingUser?.accountStatusChangedAt || null
  const nextStatusChangedBy = isOwner
    ? existingUser?.accountStatusChangedBy || 'system-owner-bootstrap'
    : existingUser?.accountStatusChangedBy || null

  const nextData = {
    clerkId: normalized.clerkId,
    email: normalized.email,
    firstName: normalized.firstName,
    lastName: normalized.lastName,
    phone: normalized.phone,
    role: nextRole,
    accountStatus: nextAccountStatus,
    accountStatusChangedAt: nextStatusChangedAt,
    accountStatusChangedBy: nextStatusChangedBy,
    deletedAt: null,
  }

  if (existingUserByClerkId) {
    return prisma.user.update({
      where: {
        clerkId: normalized.clerkId,
      },
      data: nextData,
    })
  }

  if (existingUserByEmail) {
    return prisma.user.update({
      where: {
        email: normalized.email,
      },
      data: nextData,
    })
  }

  return prisma.user.create({
    data: nextData,
  })
}
