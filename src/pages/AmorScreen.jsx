import React, { useState } from 'react'
import { Heart, Star } from 'lucide-react'
import { useApp } from '../context/AppContext'

function diasJuntos(fechaInicio) {
  return Math.floor((new Date() - new Date(fechaInicio)) / 86400000)
}

export default function AmorScreen() {
  const { data, update } = useApp()
  const [editFecha, setEditFecha] = useState(false)
  const dias = diasJuntos(data.fechaInicio)

  return (
    <div className="px-4 pt-8 pb-4 space-y-5">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-key-pink/20 flex items-center justify-center">
          <Heart size={32} className="text-key-pink animate-pulse-soft" />
        </div>
        <h1 className="font-display text-2xl font-bold text-key-text">Rincón de amor</h1>

        {/* Contador días juntos */}
        <div>
          {editFecha ? (
            <div className="flex items-center justify-center gap-2">
              <input
                type="date"
                className="input py-1 text-sm w-auto"
                value={data.fechaInicio}
                onChange={e => update('fechaInicio', e.target.value)}
              />
              <button onClick={() => setEditFecha(false)} className="btn-primary py-1 px-3 text-sm">Ok</button>
            </div>
          ) : (
            <button onClick={() => setEditFecha(true)} className="text-center">
              <p className="text-4xl font-bold text-key-pink">{dias}</p>
              <p className="text-key-muted text-sm mt-1">días juntos 💕 (toca para editar)</p>
            </button>
          )}
        </div>
      </div>

      {/* Próximos aniversarios */}
      <div className="card border-key-pink/20">
        <p className="text-xs text-key-muted mb-3 flex items-center gap-1">
          <Star size={12} className="text-key-pink" /> Próximos aniversarios
        </p>
        {[1,3,6,12,18,24,36,48,60].map(meses => {
          const fecha = new Date(data.fechaInicio)
          fecha.setMonth(fecha.getMonth() + meses)
          const diasPara = Math.ceil((fecha - new Date()) / 86400000)
          if (diasPara < 0 || diasPara > 60) return null
          return (
            <div key={meses} className="flex items-center justify-between py-2 border-b border-key-border/50 last:border-0">
              <p className="text-sm text-key-text">
                {meses < 12 ? `${meses} mes${meses > 1 ? 'es' : ''}` : `${meses/12} año${meses > 12 ? 's' : ''}`}
              </p>
              <span className="tag bg-key-pink/15 text-key-pink">
                {diasPara === 0 ? '¡Hoy! 🎉' : `en ${diasPara} días`}
              </span>
            </div>
          )
        }).filter(Boolean)}
        {[1,3,6,12,18,24,36,48,60].every(m => {
          const f = new Date(data.fechaInicio)
          f.setMonth(f.getMonth() + m)
          const d = Math.ceil((f - new Date()) / 86400000)
          return d < 0 || d > 60
        }) && <p className="text-xs text-key-muted text-center py-2">Sin aniversarios en los próximos 60 días</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-key-pink">{dias}</p>
          <p className="text-xs text-key-muted">Días juntos</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-key-purple">
            {Math.floor(dias / 30)}
          </p>
          <p className="text-xs text-key-muted">Meses juntos</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-key-teal">
            {Math.floor(dias / 7)}
          </p>
          <p className="text-xs text-key-muted">Semanas juntos</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-key-amber">
            {dias * 24}
          </p>
          <p className="text-xs text-key-muted">Horas juntos</p>
        </div>
      </div>

      {/* Mensaje bonito */}
      <div className="card border-key-pink/20 text-center py-6">
        <p className="text-4xl mb-3">💕</p>
        <p className="font-display text-key-text text-lg">
          {dias >= 365
            ? `¡${Math.floor(dias/365)} año${Math.floor(dias/365) > 1 ? 's' : ''} juntos!`
            : `${dias} días de amor`}
        </p>
        <p className="text-key-muted text-sm mt-1">Cada día contigo es especial 🌙</p>
      </div>
    </div>
  )
}