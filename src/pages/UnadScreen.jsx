import React, { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Plus, BookOpen, Lock, Unlock } from 'lucide-react'
import { useApp } from '../context/AppContext'

function diasParaCerrar(fecha) {
  const diff = new Date(fecha) - new Date()
  return Math.ceil(diff / 86400000)
}

function estaAbierto(abre, cierra) {
  const hoy = new Date()
  return hoy >= new Date(abre) && hoy <= new Date(cierra)
}

function MomentoCard({ momento, materiaId, color }) {
  const { toggleTarea } = useApp()
  const [expanded, setExpanded] = useState(true)
  const abierto = estaAbierto(momento.abre, momento.cierra)
  const dias = diasParaCerrar(momento.cierra)
  const hechas = momento.tareas.filter(t => t.hecha).length
  const total = momento.tareas.length
  const progreso = total ? (hechas / total) * 100 : 0

  let estadoColor = 'text-key-muted'
  let estadoLabel = 'Pendiente'
  let borderColor = 'border-key-border'

  if (abierto) {
    estadoColor = dias <= 3 ? 'text-red-400' : 'text-key-teal'
    estadoLabel = dias <= 0 ? '¡Cierra hoy!' : `${dias} días para cerrar`
    borderColor = dias <= 3 ? 'border-red-500/30' : 'border-key-teal/30'
  } else if (dias < 0) {
    estadoLabel = 'Cerrado'
    estadoColor = 'text-key-muted'
  } else {
    const diasAbre = Math.ceil((new Date(momento.abre) - new Date()) / 86400000)
    estadoLabel = `Abre en ${diasAbre} días`
    estadoColor = 'text-key-amber'
    borderColor = 'border-key-amber/20'
  }

  return (
    <div className={`card border ${borderColor} space-y-3`}>
      {/* Header */}
      <button className="w-full flex items-center gap-3" onClick={() => setExpanded(e => !e)}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}25` }}>
          {abierto ? <Unlock size={14} style={{ color }} /> : <Lock size={14} className="text-key-muted" />}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-key-text">{momento.nombre}</p>
          <p className={`text-xs ${estadoColor}`}>{estadoLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-key-muted">{hechas}/{total}</span>
          {expanded ? <ChevronDown size={16} className="text-key-muted" /> : <ChevronRight size={16} className="text-key-muted" />}
        </div>
      </button>

      {/* Barra de progreso */}
      <div className="h-1.5 bg-key-bg rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progreso}%`, background: color }}
        />
      </div>

      {/* Tareas */}
      {expanded && (
        <div className="space-y-2 pt-1">
          {momento.tareas.length === 0 && (
            <p className="text-xs text-key-muted text-center py-2">Sin tareas registradas</p>
          )}
          {momento.tareas.map(tarea => (
            <button
              key={tarea.id}
              onClick={() => toggleTarea(materiaId, momento.id, tarea.id)}
              className="w-full flex items-center gap-3 py-2 text-left group"
            >
              {tarea.hecha
                ? <CheckCircle2 size={18} style={{ color }} className="flex-shrink-0" />
                : <Circle size={18} className="text-key-muted flex-shrink-0 group-active:text-key-purple" />
              }
              <span className={`text-sm flex-1 ${tarea.hecha ? 'line-through text-key-muted' : 'text-key-text'}`}>
                {tarea.texto}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AddMateriaModal({ onClose, onAdd }) {
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState('#7C3AED')
  const COLORES = ['#7C3AED', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6', '#10b981']

  const submit = () => {
    if (!nombre.trim()) return
    onAdd({
      nombre: nombre.trim(),
      color,
      momentos: [
        { id: Date.now(),     nombre: 'Momento inicial',    abre: '', cierra: '', tareas: [] },
        { id: Date.now()+1,   nombre: 'Momento intermedio', abre: '', cierra: '', tareas: [] },
        { id: Date.now()+2,   nombre: 'Momento final',      abre: '', cierra: '', tareas: [] },
      ]
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end">
      <div className="w-full max-w-md mx-auto bg-key-card rounded-t-3xl p-6 space-y-4 animate-slide-up">
        <h2 className="font-display text-xl font-bold text-key-text">Nueva materia</h2>
        <input className="input" placeholder="Nombre de la materia" value={nombre} onChange={e => setNombre(e.target.value)} />
        <div>
          <p className="text-xs text-key-muted mb-2">Color</p>
          <div className="flex gap-2">
            {COLORES.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full border-2 transition-all"
                style={{ background: c, borderColor: color === c ? 'white' : 'transparent' }}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-key-muted">Los 3 momentos se crean automáticamente. Puedes editar fechas y tareas después.</p>
        <div className="flex gap-3">
          <button className="btn-ghost flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn-primary flex-1" onClick={submit}>Agregar</button>
        </div>
      </div>
    </div>
  )
}

export default function UnadScreen() {
  const { data, addMateria } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [selectedMateria, setSelectedMateria] = useState(data.materias[0]?.id || null)

  const materia = data.materias.find(m => m.id === selectedMateria)

  return (
    <div className="px-4 pt-8 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-key-text">Mis materias</h1>
          <p className="text-key-muted text-sm">UNAD — semestre actual</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 py-2">
          <Plus size={16} /> <span className="text-sm">Materia</span>
        </button>
      </div>

      {/* Selector de materias */}
      {data.materias.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {data.materias.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMateria(m.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                selectedMateria === m.id
                  ? 'text-white border-transparent'
                  : 'text-key-muted border-key-border bg-transparent'
              }`}
              style={selectedMateria === m.id ? { background: m.color } : {}}
            >
              {m.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Contenido de la materia */}
      {materia ? (
        <div className="space-y-3">
          {/* Resumen */}
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: `${materia.color}20` }}>
              <BookOpen size={18} style={{ color: materia.color }} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-key-text">{materia.nombre}</p>
              <p className="text-xs text-key-muted">
                {materia.momentos.flatMap(mo => mo.tareas).filter(t => t.hecha).length} de{' '}
                {materia.momentos.flatMap(mo => mo.tareas).length} tareas completadas
              </p>
            </div>
          </div>

          {/* Momentos */}
          {materia.momentos.map(mo => (
            <MomentoCard
              key={mo.id}
              momento={mo}
              materiaId={materia.id}
              color={materia.color}
            />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12 space-y-3">
          <p className="text-4xl">📚</p>
          <p className="font-display text-lg text-key-text">Sin materias aún</p>
          <p className="text-key-muted text-sm">Agrega tu primera materia de la UNAD</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto">
            Agregar materia
          </button>
        </div>
      )}

      {showModal && (
        <AddMateriaModal onClose={() => setShowModal(false)} onAdd={addMateria} />
      )}
    </div>
  )
}
