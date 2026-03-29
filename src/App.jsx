import React, { useState } from 'react'
import { AppProvider } from './context/AppContext'
import BottomNav from './components/BottomNav'
import Baki from './components/Baki'
import HomeScreen from './pages/HomeScreen'
import UnadScreen from './pages/UnadScreen'
import FinanzasScreen from './pages/FinanzasScreen'
import AmorScreen from './pages/AmorScreen'

export default function App() {
  const [tab, setTab] = useState('home')

  const screens = {
    home:     <HomeScreen onNavigate={setTab} />,
    unad:     <UnadScreen />,
    finanzas: <FinanzasScreen />,
    amor:     <AmorScreen />,
  }

  return (
    <AppProvider>
      <div className="relative min-h-dvh flex flex-col max-w-md mx-auto">
        {/* Ambient background glow */}
        <div className="stars" />

        {/* Page content */}
        <main className="relative z-10 flex-1 pb-24 overflow-y-auto">
          <div className="animate-slide-up">
            {screens[tab]}
          </div>
        </main>

        {/* Bottom navigation */}
        <BottomNav active={tab} onSelect={setTab} />

        {/* Baki - floating chat button */}
        <Baki />
      </div>
    </AppProvider>
  )
}
