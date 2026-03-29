import React from 'react'
import { BookOpen, Home, DollarSign, Heart } from 'lucide-react'

const tabs = [
  { id: 'home',     icon: Home,       label: 'Inicio' },
  { id: 'unad',     icon: BookOpen,   label: 'UNAD' },
  { id: 'finanzas', icon: DollarSign, label: 'Finanzas' },
  { id: 'amor',     icon: Heart,      label: 'Amor' },
]

export default function BottomNav({ active, onSelect }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50
                    bg-key-card/90 backdrop-blur-xl border-t border-key-border
                    flex items-center justify-around pb-safe">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`nav-item ${active === id ? 'active' : ''}`}
        >
          <div className={`p-2 rounded-xl transition-all duration-200
            ${active === id ? 'bg-key-purple/20 text-key-purple' : 'text-key-muted'}`}>
            <Icon size={20} strokeWidth={active === id ? 2.5 : 1.8} />
          </div>
          <span className={`text-[10px] font-medium ${active === id ? 'text-key-purple' : 'text-key-muted'}`}>
            {label}
          </span>
        </button>
      ))}
    </nav>
  )
}
