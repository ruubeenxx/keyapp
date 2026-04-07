import React, { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Plus, BookOpen, Trash2, Calendar, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

function diasParaCerrar(fecha) {
  const hoy = new Date()
  const cierre = new Date(fecha)
  // Comparar solo fechas, ignorando la hora
  const hoyStr = hoy.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
  const cierreStr = cierre.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
  const hoyDate = new Date(hoyStr)
  const cierreDate = new Date(cierreStr)
  return Math.round((cierreDate - hoyDate) / 86400000)
}

function estaAbierto(abre, cierra) {
  const hoy = new Date()
  return hoy >= new Date(abre) && hoy <= new Date(cierra)
}

function TareaItem({ tarea, materiaId, momentoId, color }) {
  const { toggleTarea, deleteTarea, updateTarea } = useApp()
  const [showFechas, setShowFechas] = useState(false)

  const abierta = tarea.abre && tarea.cierra ? estaAbierto(tarea.abre, tarea.cierra) : null
  const dias = tarea.cierra ? diasParaCerrar(tarea.cierra) : null

  let estadoLabel = ''
  let estadoColor = 'text-key-muted'

  if (tarea.abre && tarea.cierra) {
    if (abierta) {
      estadoColor = dias <= 3 ? 'text-red-400' : 'text-key-teal'
      estadoLabel = dias === 0 ? '¡Cierra hoy!' : dias < 0 ? 'Cerrada' : `Cierra en ${dias}d`
    } else if (new Date() < new Date(tarea.abre)) {
      const diasAbre = Math.ceil((new Date(tarea.abre) - new Date()) / 86400000)
      estadoLabel = diasAbre === 0 ? 'Abre hoy' : `Abre en ${diasAbre}d`
      estadoColor = 'text-key-amber'
    } else {
      estadoLabel = 'Cerrada'
      estadoColor = 'text-key-muted'
    }
  }

  return (
    <div className="border border-key-border rounded-xl overflow-hidden mb-2">
      {/* Fila principal de la tarea */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          onClick={() => toggleTarea(materiaId, momentoId, tarea.id)}
          className="flex-shrink-0"
        >
          {tarea.hecha
            ? <CheckCircle2 size={20} style={{ color }} />
            : <Circle size={20} className="text-key-muted" />
          }
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${tarea.hecha ? 'line-through text-key-muted' : 'text-key-text'}`}>
            {tarea.texto}
          </p>
          {estadoLabel && (
            <p className={`text-xs mt-0.5 ${estadoColor}`}>{estadoLabel}</p>
          )}
        </div>
        {/* Botón calendario siempre visible */}
        <button
          onClick={() => setShowFechas(f => !f)}
          className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
            showFechas ? 'bg-key-purple/20 text-key-purple' : 
            (tarea.abre || tarea.cierra) ? 'text-key-teal' : 'text-key-muted'
          }`}
        >
          <Calendar size={15} />
        </button>
        <button
          onClick={() => deleteTarea(materiaId, momentoId, tarea.id)}
          className="p-2 text-red-400/50 hover:text-red-400 transition-colors flex-shrink-0"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Panel de fechas expandible */}
      {showFechas && (
        <div className="bg-key-bg px-3 pb-3 pt-2 border-t border-key-border space-y-2">
          <p className="text-xs text-key-muted font-medium">Fechas de esta actividad</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-key-muted">Abre</label>
              <input type="date" className="input py-1.5 text-xs mt-1"
                value={tarea.abre || ''}
                onChange={e => updateTarea(materiaId, momentoId, tarea.id, { abre: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-key-muted">Cierra</label>
              <input type="date" className="input py-1.5 text-xs mt-1"
                value={tarea.cierra || ''}
                onChange={e => updateTarea(materiaId, momentoId, tarea.id, { cierra: e.target.value })} />
            </div>
          </div>
          <button onClick={() => setShowFechas(false)} className="text-xs text-key-purple font-medium">
            Listo ✓
          </button>
        </div>
      )}
    </div>
  )
}

function MomentoCard({ momento, materiaId, color }) {
  const { addTarea } = useApp()
  const [expanded, setExpanded] = useState(true)
  const [nuevaTarea, setNuevaTarea] = useState('')
  const [showAddTarea, setShowAddTarea] = useState(false)

  const hechas = momento.tareas.filter(t => t.hecha).length
  const total = momento.tareas.length
  const progreso = total ? (hechas / total) * 100 : 0

  const tareasUrgentes = momento.tareas.filter(t => {
    if (!t.cierra || t.hecha) return false
    const dias = diasParaCerrar(t.cierra)
    return dias >= 0 && dias <= 3
  })

  const borderColor = tareasUrgentes.length > 0 ? 'border-red-500/30' : 'border-key-border'

  const guardarTarea = () => {
    if (!nuevaTarea.trim()) return
    addTarea(materiaId, momento.id, nuevaTarea.trim())
    setNuevaTarea('')
    setShowAddTarea(false)
  }

  return (
    <div className={`card border ${borderColor} space-y-3`}>
      <button className="w-full flex items-center gap-3" onClick={() => setExpanded(e => !e)}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}25` }}>
          <BookOpen size={14} style={{ color }} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-key-text">{momento.nombre}</p>
          {tareasUrgentes.length > 0 && (
            <p className="text-xs text-red-400">{tareasUrgentes.length} actividad(es) urgente(s)</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-key-muted">{hechas}/{total}</span>
          {expanded ? <ChevronDown size={16} className="text-key-muted" /> : <ChevronRight size={16} className="text-key-muted" />}
        </div>
      </button>

      <div className="h-1.5 bg-key-bg rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progreso}%`, background: color }} />
      </div>

      {expanded && (
        <div className="pt-1">
          {momento.tareas.length === 0 && !showAddTarea && (
            <p className="text-xs text-key-muted text-center py-2">Sin actividades — agrega una 👇</p>
          )}
          {momento.tareas.map(tarea => (
            <TareaItem
              key={tarea.id}
              tarea={tarea}
              materiaId={materiaId}
              momentoId={momento.id}
              color={color}
            />
          ))}
          {showAddTarea ? (
            <div className="flex gap-2 pt-1">
              <input className="input py-1.5 text-sm flex-1" placeholder="Nombre de la actividad..."
                value={nuevaTarea} onChange={e => setNuevaTarea(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && guardarTarea()} autoFocus />
              <button onClick={guardarTarea} className="btn-primary py-1.5 px-3 text-sm">Ok</button>
              <button onClick={() => { setShowAddTarea(false); setNuevaTarea('') }} className="text-key-muted">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAddTarea(true)}
              className="flex items-center gap-2 text-xs text-key-muted hover:text-key-purple transition-colors pt-2 w-full">
              <Plus size={13} /> Agregar actividad
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
        { id: Date.now(),   nombre: 'Momento inicial',    tareas: [] },
        { id: Date.now()+1, nombre: 'Momento intermedio', tareas: [] },
        { id: Date.now()+2, nombre: 'Momento final',      tareas: [] },
      ]
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end">
      <div className="w-full max-w-md mx-auto bg-key-card rounded-t-3xl p-6 space-y-4 animate-slide-up pb-32">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-key-text">Nueva materia</h2>
          <button onClick={onClose} className="text-key-muted"><X size={20} /></button>
        </div>
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
        <p className="text-xs text-key-muted">Los 3 momentos se crean solos. Agrega actividades y ponles fechas dentro de cada momento.</p>
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
    if (window.confirm('¿Eliminar esta materia y todas sus actividades?')) {
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
                {materia.momentos.flatMap(mo => mo.tareas).length} actividades completadas
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