import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { updateUser, deleteUser } from '../../services/authService'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user, logout, login, token } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  if (!user) return null

  const onSave = async () => {
    setLoading(true)
    try {
      const updated = await updateUser(user.id, { name, email })
      // update auth context with new user
      login(updated, token ?? '')
      setEditing(false)
    } catch (err) {
      // TODO: show a toast
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    if (!confirm('Delete your profile? This cannot be undone.')) return
    setLoading(true)
    try {
      await deleteUser(user.id)
      // clear auth and navigate to login
      logout()
      navigate('/login')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg card">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        {!editing ? (
          <>
            <div className="mb-2">Name: {user.name}</div>
            <div className="mb-2">Email: {user.email}</div>
            <div className="mb-4">Role: {user.role}</div>
            <div className="flex items-center gap-3">
              <button onClick={() => setEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Edit</button>
              <button onClick={() => logout()} className="px-4 py-2 bg-gray-600 text-white rounded">Logout</button>
              {user.role === 'borrower' && (
                <button onClick={onDelete} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded">{loading ? 'Deleting...' : 'Delete Profile'}</button>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onSave} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">{loading ? 'Saving...' : 'Save'}</button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
