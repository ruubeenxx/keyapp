import { useState, useEffect } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('keyapp-theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.remove('light')
    } else {
      root.classList.add('light')
    }
    localStorage.setItem('keyapp-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggle = () => setIsDark(d => !d)

  return { isDark, toggle }
}