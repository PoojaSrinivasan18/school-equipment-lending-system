import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import LoginForm from './pages/Login/LoginForm'
import OTPForm from './pages/Login/OTPForm'
import ProfilePage from './pages/Profile'
import NavBar from './components/NavBar'
import EquipmentsPage from './pages/Equipments'
import EditEquipmentsPage from './pages/Requests'
import { useAuth } from './hooks/useAuth'

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
      <Route path="/login" element={<LoginPage />}>
        <Route index element={<LoginForm />} />
        <Route path="verify" element={<OTPForm />} />
      </Route>
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipments"
        element={
          <ProtectedRoute>
            <EquipmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-equipments"
        element={
          <ProtectedRoute>
            <EditEquipmentsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  )
}
