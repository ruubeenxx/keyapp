import React, { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { useTheme } from './hooks/useTheme'
import { requestNotificationPermission, listenForegroundMessages, checkTareasUrgentes } from './hooks/useNotifications'
import BottomNav from './components/BottomNav'
import Baki from './components/Baki'
import HomeScreen from './pages/HomeScreen'
import UnadScreen from './pages/UnadScreen'
import FinanzasScreen from './pages/FinanzasScreen'
import AmorScreen from './pages/AmorScreen'

// Banner de notificación en primer plano
function NotifBanner({ notif, onClose }) {
  if (!notif) return null
  return (
    <div className="fixed top-4 left-4 right-4 z-50 card border-key-purple/40 glow-purple animate-slide-up flex items-start gap-3 max-w-md mx-auto">
      <span className="text-xl flex-shrink-0">🔔</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-key-text">{notif.notification?.title}</p>
        <p className="text-xs text-key-muted mt-0.5">{notif.notification?.body}</p>
      </div>
      <button onClick={onClose} className="text-key-muted text-lg flex-shrink-0">×</button>
    </div>
  )
}

function AppContent() {
  const [tab, setTab] = useState('home')
  const { isDark, toggle } = useTheme()
  const { data } = useApp()
  const [notif, setNotif] = useState(null)

  // Pide permiso de notificaciones al cargar
  useEffect(() => {
    const init = async () => {
      await requestNotificationPermission()
      // Escucha notificaciones en primer plano
      listenForegroundMessages((payload) => {
        setNotif(payload)
        setTimeout(() => setNotif(null), 5000)
      })
    }
    // Espera 3 segundos para no abrumar al usuario al abrir
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

      {/* Banner notificación primer plano */}
      <NotifBanner notif={notif} onClose={() => setNotif(null)} />

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