import React, { useState, useRef, useEffect } from 'react'
import { X, Send, Loader } from 'lucide-react'
import { useApp } from '../context/AppContext'

const BAKI_PHOTO = '/keyapp/baki.png'
const PROXY_URL = 'https://keyapp-proxy.lrubenfernandez.workers.dev'

function BakiAvatar({ size = 40, className = '' }) {
  if (BAKI_PHOTO) {
    return (
      <img src={BAKI_PHOTO} alt="Baki"
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }} />
    )
  }
  return (
    <div className={`rounded-full bg-gradient-to-br from-key-amber to-orange-600
                    flex items-center justify-center font-display font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}>
      🐶
    </div>
  )
}

const BAKI_SYSTEM = (stats, data) => `Eres Baki, el perrito asistente de Keyla en su app KeyApp. Tu novio te hizo esta app con mucho amor.

REGLAS ESTRICTAS:
- Responde SIEMPRE en máximo 2 líneas cortas. Nunca más.
- Sé cariñoso y motivador, como si fuera un mensaje del novio de Keyla.
- No repitas el saludo ni te presentes en cada mensaje.
- Si preguntan datos, responde directo con el número.
- Varía tus respuestas, no repitas frases.

DATOS DE KEYLA:
- Días juntos: ${stats.diasJuntos}
- Gastos del período: $${stats.gastoTotal.toLocaleString('es-CO')}
- Gastos por categoría: ${JSON.stringify(stats.porCategoria)}
- Tareas UNAD: ${stats.tareasHechas} de ${stats.tareasTotal} completadas
- Materias: ${data.materias.map(m => m.nombre).join(', ') || 'ninguna aún'}

Responde en español, corto y con amor 💕`

export default function Baki() {
  const { getStats, data } = useApp()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola Keyla! 🐶 Soy Baki, tu asistente favorito. ¿En qué te puedo ayudar hoy? 🐾' }
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
      const history = [...messages, userMsg].slice(-10)
      const res = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: BAKI_SYSTEM(stats, data),
          messages: history
        })
      })
      const json = await res.json()
      const reply = json.text || '¡Arf! No pude entender eso 🐶 ¿Puedes repetir?'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '¡Arf! Parece que no tengo conexión ahora mismo 🐾'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat window — sube más cuando está abierto para no tapar nada */}
      {open && (
        <div className="fixed bottom-32 right-4 z-50 w-80 max-h-[60vh] flex flex-col
                        bg-key-card border border-key-border rounded-3xl shadow-2xl
                        animate-slide-up overflow-hidden">
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

          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {m.role === 'assistant' && <BakiAvatar size={28} className="flex-shrink-0 mt-0.5" />}
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
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

          {/* Input con botón enviar claramente visible */}
          <div className="p-3 border-t border-key-border flex gap-2 items-center">
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
              className="flex-shrink-0 w-10 h-10 bg-key-purple text-white rounded-xl
                         flex items-center justify-center disabled:opacity-40 transition-opacity"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Botón flotante — más arriba para no tapar contenido */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-28 right-4 z-40 animate-float
                   glow-purple active:scale-95 transition-transform"
      >
        <BakiAvatar size={52} className="border-2 border-key-purple shadow-lg" />
      </button>
    </>
  )
}