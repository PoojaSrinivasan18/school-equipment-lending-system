import React, { useEffect, useState } from 'react'

export default function DarkModeToggle() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    if (mode === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    try { localStorage.setItem('theme', mode) } catch {}
  }, [mode])

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={() => setMode((m) => (m === 'dark' ? 'light' : 'dark'))}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {mode === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 116.707 2.707 7 7 0 1017.293 13.293z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 4.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V5.25A.75.75 0 0110 4.5zM10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM4.5 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H5.25A.75.75 0 014.5 10zM14.25 9.25a.75.75 0 010 1.5h-1.5a.75.75 0 010-1.5h1.5zM5.22 5.22a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06L5.22 6.28a.75.75 0 010-1.06zM13.66 13.66a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM5.22 14.78a.75.75 0 000-1.06l1.06-1.06a.75.75 0 111.06 1.06L6.28 14.78a.75.75 0 00-1.06 0zM13.66 6.34a.75.75 0 000-1.06L14.72 4.22a.75.75 0 111.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0z" />
        </svg>
      )}
    </button>
  )
}
