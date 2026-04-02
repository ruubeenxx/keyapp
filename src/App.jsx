import React, { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { useTheme } from './hooks/useTheme'
import { checkTareasUrgentes, notificarFraseDelDia } from './hooks/useNotifications'
import BottomNav from './components/BottomNav'
import Baki from './components/Baki'
import HomeScreen from './pages/HomeScreen'
import UnadScreen from './pages/UnadScreen'
import FinanzasScreen from './pages/FinanzasScreen'
import AmorScreen from './pages/AmorScreen'

// Banner para pedir permisos de notificaciones en móvil
function NotifBanner({ onAllow, onDismiss }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-key-purple text-white px-4 py-3
                    flex items-center gap-3 shadow-lg animate-slide-up max-w-md mx-auto">
      <span className="text-xl flex-shrink-0">🔔</span>
      <p className="text-sm flex-1">¿Permitir notificaciones de tareas?</p>
      <button onClick={onAllow} className="text-xs font-bold bg-white text-key-purple px-3 py-1 rounded-lg flex-shrink-0">
        Sí
      </button>
      <button onClick={onDismiss} className="text-xs text-white/70 flex-shrink-0">
        No
      </button>
    </div>
  )
}

function AppContent() {
  const [tab, setTab] = useState('home')
  const { isDark, toggle } = useTheme()
  const { data } = useApp()
  const [showNotifBanner, setShowNotifBanner] = useState(false)

  useEffect(() => {
    // Verifica si ya se pidió permiso
    const timer = setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'default') {
        setShowNotifBanner(true)
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleAllowNotif = async () => {
    setShowNotifBanner(false)
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      notificarFraseDelDia()
    }
  }

  // Revisa tareas urgentes cuando cambian los datos
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

      {/* Banner notificaciones */}
      {showNotifBanner && (
        <NotifBanner
          onAllow={handleAllowNotif}
          onDismiss={() => setShowNotifBanner(false)}
        />
      )}

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