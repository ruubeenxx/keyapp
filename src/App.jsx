import React, { useState } from 'react'
import { AppProvider } from './context/AppContext'
import { useTheme } from './hooks/useTheme'
import BottomNav from './components/BottomNav'
import Baki from './components/Baki'
import HomeScreen from './pages/HomeScreen'
import UnadScreen from './pages/UnadScreen'
import FinanzasScreen from './pages/FinanzasScreen'
import AmorScreen from './pages/AmorScreen'

function AppContent() {
  const [tab, setTab] = useState('home')
  const { isDark, toggle } = useTheme()

  const screens = {
    home:     <HomeScreen onNavigate={setTab} />,
    unad:     <UnadScreen />,
    finanzas: <FinanzasScreen />,
    amor:     <AmorScreen />,
  }

  return (
    <div className="relative min-h-dvh flex flex-col max-w-md mx-auto">
      <div className="stars" />

      {/* Botón tema arriba a la derecha */}
      <button
        onClick={toggle}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full
                   bg-key-card border border-key-border
                   flex items-center justify-center text-lg
                   active:scale-95 transition-all shadow-md"
        title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <main className="relative z-10 flex-1 pb-24 overflow-y-auto">
        <div className="animate-slide-up" key={tab}>
          {screens[tab]}
        </div>
      </main>

      <BottomNav active={tab} onSelect={setTab} />
      <Baki />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}