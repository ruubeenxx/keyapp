import React, { useState, useRef, useEffect } from 'react'
import { X, Send, Loader } from 'lucide-react'
import { useApp } from '../context/AppContext'

// 🐶 Reemplaza esta URL con la foto de Baki cuando la tengas
// Por ahora usamos un placeholder con su inicial
const BAKI_PHOTO = 'keyapp/baki.png'

function BakiAvatar({ size = 40, className = '' }) {
  if (BAKI_PHOTO) {
    return (
      <img
        src={BAKI_PHOTO}
        alt="Baki"
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-key-amber to-orange-600
                  flex items-center justify-center font-display font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      🐶
    </div>
  )
}

const BAKI_SYSTEM = (stats, data) => `
Eres Baki, un perrito adorable y muy inteligente que vive en la app KeyApp.
Fuiste nombrado así por el perro real de tu dueño (el novio de Keyla).
Eres el asistente personal de Keyla, una estudiante de la UNAD.

Tu personalidad:
- Hablas con mucho amor y cariño, como un perrito fiel 🐾
- Usas emojis de perrito ocasionalmente (🐶🐾)
- Eres motivador cuando hablas de las tareas de Keyla
- Eres simpático pero también muy útil con los datos

DATOS ACTUALES DE KEYLA:
- Días juntos con su novio: ${stats.diasJuntos} días 💕
- Gastos totales del período: $${stats.gastoTotal.toLocaleString('es-CO')}
- Gasto por categoría: ${JSON.stringify(stats.porCategoria)}
- Tareas UNAD: ${stats.tareasHechas} de ${stats.tareasTotal} completadas
- Materias: ${data.materias.map(m => m.nombre).join(', ')}

Responde siempre en español, de forma corta y cariñosa.
Si te preguntan por datos, usa los datos reales de arriba.
`

export default function Baki() {
  const { getStats, data } = useApp()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola Keyla! 🐶 Soy Baki, tu asistente favorito. ¿En qué te puedo ayudar hoy? Puedes preguntarme sobre tus tareas, tus gastos, ¡lo que sea! 🐾' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef()

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const stats = getStats()
      const history = [...messages, userMsg].slice(-10) // últimos 10 mensajes

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: BAKI_SYSTEM(stats, data),
          messages: history
        })
      })
      const json = await res.json()
      const reply = json.content?.[0]?.text || '¡Arf! No pude entender eso 🐶 ¿Puedes repetir?'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '¡Arf! Parece que no tengo conexión ahora mismo 🐾 ¡Inténtalo de nuevo!'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-28 right-4 z-50 w-80 max-h-[65vh] flex flex-col
                        bg-key-card border border-key-border rounded-3xl shadow-2xl
                        animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-key-border bg-key-bg/50">
            <BakiAvatar size={36} />
            <div>
              <p className="font-display font-bold text-key-text text-sm">Baki</p>
              <p className="text-[11px] text-key-muted">Tu asistente favorito 🐾</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-key-muted hover:text-key-text">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {m.role === 'assistant' && <BakiAvatar size={28} className="flex-shrink-0 mt-0.5" />}
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-key-purple text-white rounded-tr-sm'
                    : 'bg-key-bg border border-key-border text-key-text rounded-tl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2">
                <BakiAvatar size={28} />
                <div className="bg-key-bg border border-key-border px-3 py-2 rounded-2xl rounded-tl-sm">
                  <Loader size={14} className="animate-spin text-key-muted" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-key-border flex gap-2">
            <input
              className="input py-2 text-sm flex-1"
              placeholder="Pregúntale a Baki..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-key-purple text-white p-2 rounded-xl disabled:opacity-40 transition-opacity"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-24 right-4 z-50 animate-float
                   glow-purple active:scale-95 transition-transform"
      >
        <BakiAvatar size={56} className="border-2 border-key-purple shadow-lg" />
      </button>
    </>
  )
}
