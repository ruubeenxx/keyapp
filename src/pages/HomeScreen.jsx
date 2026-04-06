import React, { useEffect, useState } from 'react'
import { BookOpen, AlertTriangle, CheckCircle2, Star, Calendar } from 'lucide-react'
import { useApp } from '../context/AppContext'

const PROXY_URL = 'https://keyapp-proxy.lrubenfernandez.workers.dev'

function diasParaCerrar(fecha) {
  const diff = new Date(fecha) - new Date()
  return Math.ceil(diff / 86400000)
}

function FraseDelDia() {
  const [frase, setFrase] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hoy = new Date().toDateString()
    const cached = localStorage.getItem('keyapp-frase')
    const cachedDate = localStorage.getItem('keyapp-frase-date')
    if (cached && cachedDate === hoy) { setFrase(cached); setLoading(false); return }

    fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: 'Eres un asistente que genera frases bonitas de amor y motivación. Responde SOLO con la frase, sin comillas, sin explicaciones, sin emojis al inicio.',
        messages: [{
          role: 'user',
          content: 'Genera UNA sola frase de amor y motivación para Keyla, una chica que estudia en la UNAD. Debe ser corta (máx 2 líneas), tierna, que la motive a hacer sus tareas y que se sienta amada.'
        }]
      })
    })
      .then(r => r.json())
      .then(d => {
        const f = d.text || 'Eres increíble, Keyla. ¡Hoy también puedes! 💕'
        setFrase(f)
        localStorage.setItem('keyapp-frase', f)
        localStorage.setItem('keyapp-frase-date', hoy)
      })
      .catch(() => setFrase('Cada tarea que completas es un paso más hacia tus sueños. ¡Tú puedes, Keyla! 💕'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="card glow-pink border-pink-500/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full -translate-y-8 translate-x-8" />
      <div className="flex items-start gap-3">
        <Star size={18} className="text-key-pink mt-0.5 flex-shrink-0 animate-pulse-soft" />
        <div>
          <p className="text-[11px] text-key-muted font-medium uppercase tracking-wider mb-1">Frase del día</p>
          {loading
            ? <div className="h-8 bg-key-border rounded-lg animate-pulse w-48" />
            : <p className="font-display text-key-text text-sm leading-relaxed italic">{frase}</p>
          }
        </div>
      </div>
    </div>
  )
}

export default function HomeScreen({ onNavigate }) {
  const { data, getStats } = useApp()
  const stats = getStats()

  const todasTareas = data.materias.flatMap(m =>
    m.momentos.flatMap(mo =>
      mo.tareas
        .filter(t => !t.hecha)
        .map(t => ({ ...t, materia: m.nombre, momento: mo.nombre }))
    )
  )

  const tareasPendientesUrgentes = todasTareas.filter(t => {
    if (!t.cierra) return false
    const dias = diasParaCerrar(t.cierra)
    return dias >= 0 && dias <= 7
  }).slice(0, 3)

  const tareasProximas = todasTareas.filter(t => {
    if (!t.cierra) return false
    const dias = diasParaCerrar(t.cierra)
    return dias > 7 && dias <= 30
  }).slice(0, 3)

  const tareasSinFecha = todasTareas.filter(t => !t.cierra).slice(0, 3)

  return (
    <div className="px-4 pt-8 pb-4 space-y-5">
      {/* Header */}
      <div>
        <p className="text-key-muted text-sm">¡Hola, mi amor! 💕</p>
        <h1 className="font-display text-3xl font-bold text-key-text">Keyla</h1>
        <p className="text-key-muted text-sm mt-0.5">{stats.diasJuntos} días juntos 🌙</p>
      </div>

      {/* Frase del día */}
      <FraseDelDia />

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onNavigate('unad')} className="card text-left active:scale-95 transition-transform">
          <BookOpen size={20} className="text-key-purple mb-2" />
          <p className="text-2xl font-bold text-key-text">{stats.tareasHechas}/{stats.tareasTotal}</p>
          <p className="text-xs text-key-muted">Tareas UNAD</p>
          <div className="mt-2 h-1.5 bg-key-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-key-purple rounded-full transition-all"
              style={{ width: stats.tareasTotal ? `${(stats.tareasHechas/stats.tareasTotal)*100}%` : '0%' }}
            />
          </div>
        </button>

        <button onClick={() => onNavigate('finanzas')} className="card text-left active:scale-95 transition-transform">
          <p className="text-xs text-key-muted mb-2">Gastos del mes</p>
          <p className="text-2xl font-bold text-key-text">
            ${stats.gastoTotal.toLocaleString('es-CO')}
          </p>
          <p className="text-xs text-key-muted mt-1">
            {data.transacciones.filter(t => t.tipo === 'gasto').length} movimientos
          </p>
        </button>
      </div>

      {/* Tareas urgentes */}
      {tareasPendientesUrgentes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            <p className="text-xs font-medium text-red-400 uppercase tracking-wider">Urgente — cierran pronto</p>
          </div>
          {tareasPendientesUrgentes.map(t => {
            const dias = diasParaCerrar(t.cierra)
            return (
              <button
                key={t.id}
                onClick={() => onNavigate('unad')}
                className="w-full card border-red-500/20 text-left flex items-center gap-3 active:scale-95 transition-transform"
              >
                <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={14} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-key-text font-medium truncate">{t.texto}</p>
                  <p className="text-xs text-key-muted truncate">{t.materia} · {t.momento}</p>
                </div>
                <span className="text-xs text-red-400 font-medium flex-shrink-0">
                  {dias === 0 ? '¡Hoy!' : `${dias}d`}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Tareas próximas */}
      {tareasProximas.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-key-teal" />
            <p className="text-xs font-medium text-key-teal uppercase tracking-wider">Tareas que cierran pronto</p>
          </div>
          {tareasProximas.map(t => (
            <button
              key={t.id}
              onClick={() => onNavigate('unad')}
              className="w-full card text-left flex items-center gap-3 active:scale-95 transition-transform"
            >
              <div className="w-8 h-8 rounded-xl bg-key-teal/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={14} className="text-key-teal" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-key-text truncate">{t.texto}</p>
                <p className="text-xs text-key-muted truncate">{t.materia} · {t.momento}</p>
              </div>
              <span className="text-xs text-key-muted flex-shrink-0">
                {diasParaCerrar(t.cierra)}d
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Tareas sin fecha */}
      {tareasSinFecha.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-key-muted" />
            <p className="text-xs font-medium text-key-muted uppercase tracking-wider">Sin fecha asignada</p>
          </div>
          {tareasSinFecha.map(t => (
            <button
              key={t.id}
              onClick={() => onNavigate('unad')}
              className="w-full card text-left flex items-center gap-3 active:scale-95 transition-transform"
            >
              <div className="w-8 h-8 rounded-xl bg-key-muted/20 flex items-center justify-center flex-shrink-0">
                <Calendar size={14} className="text-key-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-key-text truncate">{t.texto}</p>
                <p className="text-xs text-key-muted truncate">{t.materia} · {t.momento}</p>
              </div>
              <span className="text-xs text-key-amber flex-shrink-0">Ponle fecha</span>
            </button>
          ))}
        </div>
      )}

      {tareasPendientesUrgentes.length === 0 && tareasProximas.length === 0 && tareasSinFecha.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-key-text font-medium">¡Sin tareas pendientes!</p>
          <p className="text-key-muted text-sm">¡Eres una campeona, Keyla! 💕</p>
        </div>
      )}
    </div>
  )
}