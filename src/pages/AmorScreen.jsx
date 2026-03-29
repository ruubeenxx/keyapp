import React, { useState } from 'react'
import { Heart, BookHeart, Star, Plus, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'

function diasJuntos(fechaInicio) {
  return Math.floor((new Date() - new Date(fechaInicio)) / 86400000)
}

export default function AmorScreen() {
  const { data, addEntradaDiario, addMeta, toggleMeta, update } = useApp()
  const [tab, setTab] = useState('inicio')
  const [nuevaDiario, setNuevaDiario] = useState('')
  const [nuevaMeta, setNuevaMeta] = useState('')
  const [editFecha, setEditFecha] = useState(false)
  const dias = diasJuntos(data.fechaInicio)

  const saveDiario = () => {
    if (!nuevaDiario.trim()) return
    addEntradaDiario(nuevaDiario.trim())
    setNuevaDiario('')
  }

  const saveMeta = () => {
    if (!nuevaMeta.trim()) return
    addMeta(nuevaMeta.trim())
    setNuevaMeta('')
  }

  return (
    <div className="px-4 pt-8 pb-4 space-y-5">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-key-pink/20 flex items-center justify-center">
          <Heart size={32} className="text-key-pink animate-pulse-soft" />
        </div>
        <h1 className="font-display text-2xl font-bold text-key-text">Rincón de amor</h1>
        <div>
          {editFecha ? (
            <div className="flex items-center justify-center gap-2">
              <input type="date" className="input py-1 text-sm w-auto" value={data.fechaInicio}
                onChange={e => update('fechaInicio', e.target.value)} />
              <button onClick={() => setEditFecha(false)} className="btn-primary py-1 px-3 text-sm">Ok</button>
            </div>
          ) : (
            <button onClick={() => setEditFecha(true)} className="text-center">
              <p className="text-3xl font-bold text-key-pink">{dias}</p>
              <p className="text-key-muted text-sm">días juntos 💕 (toca para editar)</p>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-key-bg rounded-xl p-1">
        {[['inicio','💕 Inicio'],['diario','📖 Diario'],['metas','🌟 Metas']].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === id ? 'bg-key-pink text-white' : 'text-key-muted'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* INICIO */}
      {tab === 'inicio' && (
        <div className="space-y-4">
          {/* Aniversarios próximos */}
          <div className="card border-key-pink/20">
            <p className="text-xs text-key-muted mb-3 flex items-center gap-1">
              <Star size={12} className="text-key-pink" /> Próximos aniversarios
            </p>
            {[1,3,6,12,18,24].map(meses => {
              const fecha = new Date(data.fechaInicio)
              fecha.setMonth(fecha.getMonth() + meses)
              const diasPara = Math.ceil((fecha - new Date()) / 86400000)
              if (diasPara < 0 || diasPara > 60) return null
              return (
                <div key={meses} className="flex items-center justify-between py-2 border-b border-key-border/50 last:border-0">
                  <p className="text-sm text-key-text">{meses === 1 ? '1 mes' : meses < 12 ? `${meses} meses` : `${meses/12} año${meses > 12 ? 's' : ''}`}</p>
                  <span className="tag bg-key-pink/15 text-key-pink">
                    {diasPara === 0 ? '¡Hoy! 🎉' : `en ${diasPara} días`}
                  </span>
                </div>
              )
            }).filter(Boolean)}
            {[1,3,6,12,18,24].every(m => {
              const f = new Date(data.fechaInicio); f.setMonth(f.getMonth()+m)
              const d = Math.ceil((f-new Date())/86400000)
              return d < 0 || d > 60
            }) && <p className="text-xs text-key-muted text-center py-2">Sin aniversarios en los próximos 60 días</p>}
          </div>

          {/* Stats bonitos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center">
              <p className="text-2xl font-bold text-key-pink">{dias}</p>
              <p className="text-xs text-key-muted">Días juntos</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-key-purple">{data.metas.filter(m => m.hecha).length}</p>
              <p className="text-xs text-key-muted">Metas cumplidas</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-key-teal">{data.diario.length}</p>
              <p className="text-xs text-key-muted">Entradas en diario</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-key-amber">{data.metas.length}</p>
              <p className="text-xs text-key-muted">Sueños juntos</p>
            </div>
          </div>
        </div>
      )}

      {/* DIARIO */}
      {tab === 'diario' && (
        <div className="space-y-4">
          <div className="card space-y-3">
            <p className="text-xs text-key-muted flex items-center gap-1"><BookHeart size={12}/> Nueva entrada</p>
            <textarea
              className="input resize-none h-24 text-sm"
              placeholder="¿Cómo te sientes hoy, Keyla? 💭"
              value={nuevaDiario}
              onChange={e => setNuevaDiario(e.target.value)}
            />
            <button className="btn-primary w-full" onClick={saveDiario}>Guardar entrada</button>
          </div>
          <div className="space-y-3">
            {[...data.diario].reverse().map(e => (
              <div key={e.id} className="card border-key-pink/10">
                <p className="text-xs text-key-muted mb-2">
                  {new Date(e.fecha).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="text-sm text-key-text leading-relaxed">{e.texto}</p>
              </div>
            ))}
            {data.diario.length === 0 && (
              <div className="card text-center py-8">
                <p className="text-3xl mb-2">📖</p>
                <p className="text-key-muted text-sm">Tu diario está vacío. ¡Escribe tu primera entrada!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* METAS */}
      {tab === 'metas' && (
        <div className="space-y-4">
          <div className="card space-y-3">
            <p className="text-xs text-key-muted flex items-center gap-1"><Star size={12}/> Nuevo sueño o meta</p>
            <input className="input text-sm" placeholder="¿Qué quieren lograr juntos? ✨"
              value={nuevaMeta} onChange={e => setNuevaMeta(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveMeta()} />
            <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={saveMeta}>
              <Plus size={16} /> Agregar meta
            </button>
          </div>
          <div className="space-y-2">
            {data.metas.map(m => (
              <button key={m.id} onClick={() => toggleMeta(m.id)}
                className="w-full card text-left flex items-center gap-3 active:scale-95 transition-transform">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  m.hecha ? 'bg-key-pink/20' : 'bg-key-bg border border-key-border'
                }`}>
                  {m.hecha && <Check size={14} className="text-key-pink" />}
                </div>
                <p className={`text-sm flex-1 ${m.hecha ? 'line-through text-key-muted' : 'text-key-text'}`}>
                  {m.texto}
                </p>
              </button>
            ))}
            {data.metas.length === 0 && (
              <div className="card text-center py-8">
                <p className="text-3xl mb-2">🌟</p>
                <p className="text-key-muted text-sm">Sin metas aún. ¡El cielo es el límite!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
