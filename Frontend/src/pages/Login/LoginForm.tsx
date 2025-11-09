import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserById, sendOtp } from '../../services/authService'

export default function LoginForm() {
  const [id, setId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const num = Number(id)
    if (!Number.isInteger(num) || num <= 0) return setError('Please enter a valid numeric ID')
    setLoading(true)
    try {
  const user = await getUserById(num)
  await sendOtp(user.id)
      navigate('verify', { state: { userId: user.id } })
    } catch (err: any) {
      setError(err?.message || 'User not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md mx-auto card">
      <h2 className="text-2xl font-semibold mb-4">Welcome back</h2>
      <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">Enter your numeric user ID to continue</p>
      <label className="block mb-2 text-sm font-medium">Numeric User ID</label>
      <input
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="input mb-3"
        placeholder="Enter your numeric ID"
      />
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <button
        type="submit"
        className="w-full btn btn-primary"
        disabled={loading}
      >
        {loading ? 'Checking...' : 'Continue'}
      </button>
    </form>
  )
}
