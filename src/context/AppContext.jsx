import React, { createContext, useContext, useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'

const AppContext = createContext()

// ID único para Keyla — puedes cambiarlo si quieres
const USER_ID = 'keyla'

const DEFAULT_DATA = {
  materias: [],
  transacciones: [],
  presupuestos: [],
  fechaInicio: '2024-06-15',
  fraseHoy: '',
  diario: [],
  metas: [],
}

export function AppProvider({ children }) {
  const [data, setData] = useState(() => {
    // Carga local mientras sincroniza con Firebase
    try {
      const saved = localStorage.getItem('keyapp-data')
      return saved ? { ...DEFAULT_DATA, ...JSON.parse(saved) } : DEFAULT_DATA
    } catch { return DEFAULT_DATA }
  })
  const [synced, setSynced] = useState(false)

  // Escucha cambios en Firebase en tiempo real
  useEffect(() => {
    const ref = doc(db, 'usuarios', USER_ID)
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const remote = snap.data()
        setData(prev => ({ ...DEFAULT_DATA, ...prev, ...remote }))
        localStorage.setItem('keyapp-data', JSON.stringify({ ...DEFAULT_DATA, ...remote }))
      }
      setSynced(true)
    }, (err) => {
      console.warn('Firebase offline, usando datos locales', err)
      setSynced(true)
    })
    return () => unsub()
  }, [])

  // Guarda en Firebase y localStorage cada vez que cambian los datos
  const update = async (key, value) => {
    const newData = { ...data, [key]: value }
    setData(newData)
    localStorage.setItem('keyapp-data', JSON.stringify(newData))
    try {
      await setDoc(doc(db, 'usuarios', USER_ID), newData)
    } catch (e) {
      console.warn('No se pudo guardar en Firebase, guardado local', e)
    }
  }

  // ── UNAD ──
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

  const addTarea = (materiaId, momentoId, texto) => {
    const nuevas = data.materias.map(m => {
      if (m.id !== materiaId) return m
      return {
        ...m,
        momentos: m.momentos.map(mo => {
          if (mo.id !== momentoId) return mo
          return {
            ...mo,
            tareas: [...mo.tareas, { id: Date.now(), texto, hecha: false }]
          }
        })
      }
    })
    update('materias', nuevas)
  }

  const deleteTarea = (materiaId, momentoId, tareaId) => {
    const nuevas = data.materias.map(m => {
      if (m.id !== materiaId) return m
      return {
        ...m,
        momentos: m.momentos.map(mo => {
          if (mo.id !== momentoId) return mo
          return { ...mo, tareas: mo.tareas.filter(t => t.id !== tareaId) }
        })
      }
    })
    update('materias', nuevas)
  }

  const updateMomento = (materiaId, momentoId, campos) => {
    const nuevas = data.materias.map(m => {
      if (m.id !== materiaId) return m
      return {
        ...m,
        momentos: m.momentos.map(mo =>
          mo.id === momentoId ? { ...mo, ...campos } : mo
        )
      }
    })
    update('materias', nuevas)
  }

  const deleteMateria = (materiaId) => {
    update('materias', data.materias.filter(m => m.id !== materiaId))
  }

  // ── Finanzas ──
  const addTransaccion = (t) => {
    update('transacciones', [
      ...data.transacciones,
      { ...t, id: Date.now(), fecha: new Date().toISOString() }
    ])
  }

  const addPresupuesto = (p) => {
    const exists = data.presupuestos.find(x => x.categoria === p.categoria)
    if (exists) {
      update('presupuestos', data.presupuestos.map(x =>
        x.categoria === p.categoria ? { ...x, limite: p.limite } : x
      ))
    } else {
      update('presupuestos', [...data.presupuestos, { ...p, id: Date.now() }])
    }
  }

  // ── Amor ──
  const addEntradaDiario = (texto) => {
    update('diario', [
      ...data.diario,
      { id: Date.now(), texto, fecha: new Date().toISOString() }
    ])
  }

  const addMeta = (meta) => {
    update('metas', [...data.metas, { id: Date.now(), texto: meta, hecha: false }])
  }

  const toggleMeta = (id) => {
    update('metas', data.metas.map(m => m.id === id ? { ...m, hecha: !m.hecha } : m))
  }

  // ── Stats para Baki ──
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
      data, update, synced,
      addMateria, toggleTarea, addTarea, deleteTarea, updateMomento, deleteMateria,
      addTransaccion, addPresupuesto,
      addEntradaDiario, addMeta, toggleMeta,
      getStats
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)