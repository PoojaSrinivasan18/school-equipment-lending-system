import React from 'react'
import { NavLink } from 'react-router-dom'
import DarkModeToggle from './DarkModeToggle'
import { useAuth } from '../hooks/useAuth'
export default function NavBar() {
  const { user } = useAuth()

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-xl font-semibold text-brand-500">SchoolEQP</div>
          <nav className="hidden sm:flex items-center gap-2">
            <NavLink to="/equipments" className={({ isActive }) => `px-3 py-1 rounded-md ${isActive ? 'bg-brand-500 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              Equipments
            </NavLink>
            {/* Requests (admin-only) */}
            {user?.role === 'admin' && (
              <NavLink to="/edit-equipments" className={({ isActive }) => `px-3 py-1 rounded-md ${isActive ? 'bg-brand-500 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                Edit Equipments
              </NavLink>
            )}
            <NavLink to="/profile" className={({ isActive }) => `px-3 py-1 rounded-md ${isActive ? 'bg-brand-500 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              Profile
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-300">
            {user ? `Signed in as ${user.name}` : 'Not signed in'}
          </div>
          <DarkModeToggle />
        </div>
      </div>
    </header>
  )
}
 
