import { User } from '../types/api'
import { apiGet, apiPut, apiDelete } from './api'

type OtpRecord = {
  code: string
  expiresAt: number
}

const OTP_KEY = (userId: number) => `otp:${userId}`

export async function getUserById(id: number): Promise<User> {
  const base = (import.meta as any).env?.VITE_API_BASE_URL
  if (base) {
    // Use axios helper
    const data = await apiGet<User>(`/users/${id}`)
    return data
  }
  if (id === 1) {
    return {
      id: 1,
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'borrower'
    }
  }
  // admin demo user for prototyping
  if (id === 2) {
    return {
      id: 2,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin'
    }
  }
  throw new Error('user not found')
}

// Legacy/mock exports kept for local prototyping
export function sendMockOtp(userId: number): Promise<{ ttl: number }> {
  const code = Math.floor(1000 + Math.random() * 9000).toString()
  const ttl = 10 * 60
  const expiresAt = Date.now() + ttl * 1000
  const rec: OtpRecord = { code, expiresAt }
  try {
    localStorage.setItem(OTP_KEY(userId), JSON.stringify(rec))
  } catch (e) {}
  // eslint-disable-next-line no-console
  console.info(`Mock OTP for user ${userId}: ${code} (ttl ${ttl}s)`)
  return Promise.resolve({ ttl })
}

export async function verifyMockOtp(userId: number, otp: string): Promise<{ token: string; user: User }> {
  const raw = localStorage.getItem(OTP_KEY(userId))
  if (!raw) throw new Error('otp not sent or expired')
  const rec: OtpRecord = JSON.parse(raw)
  if (Date.now() > rec.expiresAt) {
    localStorage.removeItem(OTP_KEY(userId))
    throw new Error('otp expired')
  }
  if (rec.code !== otp) throw new Error('invalid otp')
  localStorage.removeItem(OTP_KEY(userId))
  const user = await getUserById(userId)
  const token = `mock-token-${userId}-${Date.now()}`
  return { token, user }
}

// Primary functions used by the app. They call real endpoints when VITE_API_BASE_URL is set, otherwise fall back to mocks above.
// For the prototype we always handle OTP locally: after confirming the user exists
// (via `getUserById` which may call the backend), we generate and print the
// OTP to the console and persist it in localStorage. This avoids any backend
// OTP wiring and simplifies prototyping.
export async function sendOtp(userId: number): Promise<{ ttl: number }> {
  return sendMockOtp(userId)
}

export async function verifyOtp(userId: number, otp: string): Promise<{ token: string; user: User }> {
  return verifyMockOtp(userId, otp)
}

// Update user profile (backend when VITE_API_BASE_URL is set, otherwise update local mock / auth_user)
export async function updateUser(id: number, payload: Partial<User>): Promise<User> {
  const base = (import.meta as any).env?.VITE_API_BASE_URL
  if (base) {
    const data = await apiPut<User, Partial<User>>(`/users/${id}`, payload)
    return data
  }
  // local mock: if the current stored auth_user matches, update it
  try {
    const raw = localStorage.getItem('auth_user')
    if (raw) {
      const cur: User = JSON.parse(raw)
      if (cur && cur.id === id) {
        const merged = { ...cur, ...payload, updatedAt: new Date().toISOString() }
        localStorage.setItem('auth_user', JSON.stringify(merged))
        return merged
      }
    }
    // otherwise, return a merged object (not persisted globally in this mock)
    const merged: User = { id, name: payload.name || 'Unnamed', email: payload.email || 'unknown@example.com', role: payload.role || 'borrower', updatedAt: new Date().toISOString() }
    return merged
  } catch (e) {
    throw new Error('failed to update user')
  }
}

// Delete user (backend when VITE_API_BASE_URL is set, otherwise clear local auth and remove mock user data if present)
export async function deleteUser(id: number): Promise<{ message: string }> {
  const base = (import.meta as any).env?.VITE_API_BASE_URL
  if (base) {
    const data = await apiDelete<{ message: string }>(`/users/${id}`)
    return data
  }
  try {
    // If deleting current user, clear auth
    try {
      const raw = localStorage.getItem('auth_user')
      if (raw) {
        const cur: User = JSON.parse(raw)
        if (cur && cur.id === id) {
          localStorage.removeItem('auth_user')
          localStorage.removeItem('auth_token')
        }
      }
    } catch {}
    return { message: 'User deleted (mock)' }
  } catch (e) {
    throw new Error('failed to delete user')
  }
}
