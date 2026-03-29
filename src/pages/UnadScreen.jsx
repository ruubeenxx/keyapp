import React, { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Plus, BookOpen, Lock, Unlock, Trash2, Calendar, X } from 'lucide-react'
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
  const { toggleTarea, addTarea, deleteTarea, updateMomento } = useApp()
  const [expanded, setExpanded] = useState(true)
  const [editFechas, setEditFechas] = useState(false)
  const [nuevaTarea, setNuevaTarea] = useState('')
  const [showAddTarea, setShowAddTarea] = useState(false)

  const abierto = estaAbierto(momento.abre, momento.cierra)
  const dias = diasParaCerrar(momento.cierra)
  const hechas = momento.tareas.filter(t => t.hecha).length
  const total = momento.tareas.length
  const progreso = total ? (hechas / total) * 100 : 0

  let estadoColor = 'text-key-muted'
  let estadoLabel = 'Sin fechas — toca el calendario'
  let borderColor = 'border-key-border'

  if (momento.abre && momento.cierra) {
    if (abierto) {
      estadoColor = dias <= 3 ? 'text-red-400' : 'text-key-teal'
      estadoLabel = dias <= 0 ? '¡Cierra hoy!' : `${dias} días para cerrar`
      borderColor = dias <= 3 ? 'border-red-500/30' : 'border-key-teal/30'
    } else if (dias < 0) {
      estadoLabel = 'Cerrado'
      estadoColor = 'text-key-muted'
    } else {
      const diasAbre = Math.ceil((new Date(momento.abre) - new Date()) / 86400000)
      estadoLabel = diasAbre > 0 ? `Abre en ${diasAbre} días` : 'Por abrir'
      estadoColor = 'text-key-amber'
      borderColor = 'border-key-amber/20'
    }
  }

  const guardarTarea = () => {
    if (!nuevaTarea.trim()) return
    addTarea(materiaId, momento.id, nuevaTarea.trim())
    setNuevaTarea('')
    setShowAddTarea(false)
  }

  return (
    <div className={`card border ${borderColor} space-y-3`}>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-3 flex-1" onClick={() => setExpanded(e => !e)}>
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
        <button
          onClick={() => setEditFechas(e => !e)}
          className={`p-1.5 rounded-lg transition-colors ${editFechas ? 'text-key-purple bg-key-purple/20' : 'text-key-muted'}`}
        >
          <Calendar size={14} />
        </button>
      </div>

      {editFechas && (
        <div className="bg-key-bg rounded-xl p-3 space-y-2 border border-key-border">
          <p className="text-xs text-key-muted font-medium">Fechas del momento</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-key-muted">Abre</label>
              <input type="date" className="input py-1.5 text-xs mt-1" value={momento.abre}
                onChange={e => updateMomento(materiaId, momento.id, { abre: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-key-muted">Cierra</label>
              <input type="date" className="input py-1.5 text-xs mt-1" value={momento.cierra}
                onChange={e => updateMomento(materiaId, momento.id, { cierra: e.target.value })} />
            </div>
          </div>
          <button onClick={() => setEditFechas(false)} className="text-xs text-key-purple font-medium">
            Guardar fechas ✓
          </button>
        </div>
      )}

      <div className="h-1.5 bg-key-bg rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progreso}%`, background: color }} />
      </div>

      {expanded && (
        <div className="space-y-1 pt-1">
          {momento.tareas.length === 0 && !showAddTarea && (
            <p className="text-xs text-key-muted text-center py-2">Sin tareas — agrega una 👇</p>
          )}
          {momento.tareas.map(tarea => (
            <div key={tarea.id} className="flex items-center gap-2 group">
              <button onClick={() => toggleTarea(materiaId, momento.id, tarea.id)}
                className="flex items-center gap-3 flex-1 py-1.5 text-left">
                {tarea.hecha
                  ? <CheckCircle2 size={18} style={{ color }} className="flex-shrink-0" />
                  : <Circle size={18} className="text-key-muted flex-shrink-0" />}
                <span className={`text-sm flex-1 ${tarea.hecha ? 'line-through text-key-muted' : 'text-key-text'}`}>
                  {tarea.texto}
                </span>
              </button>
              <button onClick={() => deleteTarea(materiaId, momento.id, tarea.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-red-400/60 hover:text-red-400 transition-all">
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {showAddTarea ? (
            <div className="flex gap-2 pt-1">
              <input className="input py-1.5 text-sm flex-1" placeholder="Nombre de la tarea..."
                value={nuevaTarea} onChange={e => setNuevaTarea(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && guardarTarea()} autoFocus />
              <button onClick={guardarTarea} className="btn-primary py-1.5 px-3 text-sm">Ok</button>
              <button onClick={() => { setShowAddTarea(false); setNuevaTarea('') }} className="text-key-muted">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAddTarea(true)}
              className="flex items-center gap-2 text-xs text-key-muted hover:text-key-purple transition-colors pt-1 w-full">
              <Plus size={13} /> Agregar tarea
            </button>
          )}
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
      nombre: nombre.trim(), color,
      momentos: [
        { id: Date.now(),   nombre: 'Momento inicial',    abre: '', cierra: '', tareas: [] },
        { id: Date.now()+1, nombre: 'Momento intermedio', abre: '', cierra: '', tareas: [] },
        { id: Date.now()+2, nombre: 'Momento final',      abre: '', cierra: '', tareas: [] },
      ]
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end">
      <div className="w-full max-w-md mx-auto bg-key-card rounded-t-3xl p-6 space-y-4 animate-slide-up">
        <h2 className="font-display text-xl font-bold text-key-text">Nueva materia</h2>
        <input className="input" placeholder="Nombre de la materia" value={nombre}
          onChange={e => setNombre(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} autoFocus />
        <div>
          <p className="text-xs text-key-muted mb-2">Color</p>
          <div className="flex gap-2">
            {COLORES.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full border-2 transition-all"
                style={{ background: c, borderColor: color === c ? 'white' : 'transparent' }} />
            ))}
          </div>
        </div>
        <p className="text-xs text-key-muted">Los 3 momentos se crean solos. Edita fechas y tareas dentro de cada uno.</p>
        <div className="flex gap-3">
          <button className="btn-ghost flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn-primary flex-1" onClick={submit}>Agregar</button>
        </div>
      </div>
    </div>
  )
}

export default function UnadScreen() {
  const { data, addMateria, deleteMateria } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [selectedMateria, setSelectedMateria] = useState(data.materias[0]?.id || null)
  const materia = data.materias.find(m => m.id === selectedMateria)

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar esta materia y todas sus tareas?')) {
      deleteMateria(id)
      setSelectedMateria(data.materias.find(m => m.id !== id)?.id || null)
    }
  }

  return (
    <div className="px-4 pt-8 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-key-text">Mis materias</h1>
          <p className="text-key-muted text-sm">UNAD — semestre actual</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 py-2">
          <Plus size={16} /> <span className="text-sm">Materia</span>
        </button>
      </div>

      {data.materias.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {data.materias.map(m => (
            <div key={m.id} className="flex-shrink-0 flex items-center gap-1">
              <button onClick={() => setSelectedMateria(m.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  selectedMateria === m.id ? 'text-white border-transparent' : 'text-key-muted border-key-border'
                }`}
                style={selectedMateria === m.id ? { background: m.color } : {}}>
                {m.nombre}
              </button>
              {selectedMateria === m.id && (
                <button onClick={() => handleDelete(m.id)} className="p-1 text-red-400/50 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {materia ? (
        <div className="space-y-3">
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${materia.color}20` }}>
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
          {materia.momentos.map(mo => (
            <MomentoCard key={mo.id} momento={mo} materiaId={materia.id} color={materia.color} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12 space-y-3">
          <p className="text-4xl">📚</p>
          <p className="font-display text-lg text-key-text">Sin materias aún</p>
          <p className="text-key-muted text-sm">Agrega tu primera materia de la UNAD</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto">Agregar materia</button>
        </div>
      )}

      {showModal && <AddMateriaModal onClose={() => setShowModal(false)} onAdd={addMateria} />}
    </div>
  )
}