import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

const DEFAULT_DATA = {
  // UNAD
  materias: [
    {
      id: 1,
      nombre: 'Cálculo Diferencial',
      color: '#7C3AED',
      momentos: [
        { id: 1, nombre: 'Momento inicial',    abre: '2025-01-15', cierra: '2025-02-10', tareas: [{ id: 1, texto: 'Foro de presentación', hecha: false }, { id: 2, texto: 'Quiz unidad 1', hecha: false }] },
        { id: 2, nombre: 'Momento intermedio', abre: '2025-02-11', cierra: '2025-03-20', tareas: [{ id: 3, texto: 'Trabajo colaborativo 1', hecha: false }] },
        { id: 3, nombre: 'Momento final',      abre: '2025-03-21', cierra: '2025-04-30', tareas: [{ id: 4, texto: 'Evaluación final', hecha: false }] },
      ]
    }
  ],
  // Finanzas
  transacciones: [],
  presupuestos: [],
  // Amor
  fechaInicio: '2023-06-24',
  fraseHoy: '',
  diario: [],
  metas: [],
}

export function AppProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('keyapp-data')
      return saved ? { ...DEFAULT_DATA, ...JSON.parse(saved) } : DEFAULT_DATA
    } catch { return DEFAULT_DATA }
  })

  useEffect(() => {
    localStorage.setItem('keyapp-data', JSON.stringify(data))
  }, [data])

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }))

  // Helpers UNAD
  const addMateria = (materia) => {
    update('materias', [...data.materias, { ...materia, id: Date.now() }])
  }
  const toggleTarea = (materiaId, momentoId, tareaId) => {
    const nuevas = data.materias.map(m => {
      if (m.id !== materiaId) return m
      return {
        ...m,
        momentos: m.momentos.map(mo => {
          if (mo.id !== momentoId) return mo
          return {
            ...mo,
            tareas: mo.tareas.map(t =>
              t.id === tareaId ? { ...t, hecha: !t.hecha } : t
            )
          }
        })
      }
    })
    update('materias', nuevas)
  }

  // Helpers finanzas
  const addTransaccion = (t) => {
    update('transacciones', [...data.transacciones, { ...t, id: Date.now(), fecha: new Date().toISOString() }])
  }
  const addPresupuesto = (p) => {
    const exists = data.presupuestos.find(x => x.categoria === p.categoria)
    if (exists) {
      update('presupuestos', data.presupuestos.map(x => x.categoria === p.categoria ? { ...x, limite: p.limite } : x))
    } else {
      update('presupuestos', [...data.presupuestos, { ...p, id: Date.now() }])
    }
  }

  // Helpers amor
  const addEntradaDiario = (texto) => {
    update('diario', [...data.diario, { id: Date.now(), texto, fecha: new Date().toISOString() }])
  }
  const addMeta = (meta) => {
    update('metas', [...data.metas, { id: Date.now(), texto: meta, hecha: false }])
  }
  const toggleMeta = (id) => {
    update('metas', data.metas.map(m => m.id === id ? { ...m, hecha: !m.hecha } : m))
  }

  // Stats para Baki
  const getStats = () => {
    const hoy = new Date()
    const inicio = new Date(data.fechaInicio)
    const diasJuntos = Math.floor((hoy - inicio) / 86400000)

    const gastoTotal = data.transacciones
      .filter(t => t.tipo === 'gasto')
      .reduce((s, t) => s + t.monto, 0)

    const porCategoria = {}
    data.transacciones.filter(t => t.tipo === 'gasto').forEach(t => {
      porCategoria[t.categoria] = (porCategoria[t.categoria] || 0) + t.monto
    })

    const tareasTotal = data.materias.flatMap(m => m.momentos.flatMap(mo => mo.tareas))
    const tareasHechas = tareasTotal.filter(t => t.hecha).length

    return { diasJuntos, gastoTotal, porCategoria, tareasTotal: tareasTotal.length, tareasHechas }
  }

  return (
    <AppContext.Provider value={{
      data, update,
      addMateria, toggleTarea,
      addTransaccion, addPresupuesto,
      addEntradaDiario, addMeta, toggleMeta,
      getStats
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
