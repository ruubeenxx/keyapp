import React, { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { useTheme } from './hooks/useTheme'
import { requestNotificationPermission, checkTareasUrgentes, notificarFraseDelDia } from './hooks/useNotifications'
import BottomNav from './components/BottomNav'
import Baki from './components/Baki'
import HomeScreen from './pages/HomeScreen'
import UnadScreen from './pages/UnadScreen'
import FinanzasScreen from './pages/FinanzasScreen'
import AmorScreen from './pages/AmorScreen'

function AppContent() {
  const [tab, setTab] = useState('home')
  const { isDark, toggle } = useTheme()
  const { data } = useApp()

  useEffect(() => {
    // Pide permiso y muestra frase del día después de 3 segundos
    const init = async () => {
      const granted = await requestNotificationPermission()
      if (granted) {
        notificarFraseDelDia()
      }
    }
    const timer = setTimeout(init, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Revisa tareas urgentes cada vez que cambian los datos
  useEffect(() => {
    if (data.materias?.length > 0) {
      checkTareasUrgentes(data.materias)
    }
  }, [data.materias])

  const screens = {
    home:     <HomeScreen onNavigate={setTab} />,
    unad:     <UnadScreen />,
    finanzas: <FinanzasScreen />,
    amor:     <AmorScreen />,
  }

  return (
    <div className="relative min-h-dvh flex flex-col max-w-md mx-auto">
      <div className="stars" />

      {/* Botón tema */}
      <button
        onClick={toggle}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full
                   bg-key-card border border-key-border
                   flex items-center justify-center text-lg
                   active:scale-95 transition-all shadow-md"
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