import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { verifyOtp, getUserById } from '../../services/authService'
import { useAuth } from '../../hooks/useAuth'

export default function OTPForm() {
  const loc = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const userId = (loc.state as any)?.userId as number | undefined
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      // If no userId (for example when the page is refreshed), redirect back to login
      // but render a small message while navigating so the UI isn't blank.
      navigate('/login')
      return
    }
    ;(async () => {
      try {
        const u = await getUserById(userId)
        setUserEmail(u.email)
      } catch {
        // ignore
      }
    })()
  }, [userId])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (otp.length !== 4) return setError('Enter 4-digit code')
    setLoading(true)
    try {
  const { token, user } = await verifyOtp(userId!, otp)
  login(user, token)
  // After login, navigate to equipments list (borrower landing)
  navigate('/equipments')
    } catch (err: any) {
      setError(err?.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md mx-auto card">
      <h2 className="text-xl font-semibold mb-4">Enter OTP</h2>
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">We sent a 4-digit code to {userEmail ?? 'your email'}</div>
      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
        className="input mb-3 text-center text-lg"
        placeholder="----"
      />
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <button type="submit" className="w-full btn btn-primary" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify'}
      </button>
    </form>
  )
}
