import React, { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Target, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { useApp } from '../context/AppContext'

const CATEGORIAS = ['Comida', 'Transporte', 'Estudio', 'Ropa', 'Salud', 'Entretenimiento', 'Servicios', 'Otro']
const COLORES_CAT = { Comida:'#7C3AED', Transporte:'#14b8a6', Estudio:'#ec4899', Ropa:'#f59e0b', Salud:'#10b981', Entretenimiento:'#3b82f6', Servicios:'#8b5cf6', Otro:'#9d8ec4' }

function AddModal({ onClose }) {
  const { addTransaccion, addPresupuesto } = useApp()
  const [tab, setTab] = useState('gasto')
  const [form, setForm] = useState({ monto: '', categoria: 'Comida', descripcion: '' })

  const save = () => {
    if (!form.monto) return
    if (tab === 'presupuesto') {
      addPresupuesto({ categoria: form.categoria, limite: Number(form.monto) })
    } else {
      addTransaccion({ tipo: tab, monto: Number(form.monto), categoria: form.categoria, descripcion: form.descripcion })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={onClose}>
      <div
        className="w-full max-w-md mx-auto bg-key-card rounded-t-3xl p-6 space-y-4 animate-slide-up pb-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header con X */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-key-text">Registrar</h2>
          <button onClick={onClose} className="p-2 text-key-muted hover:text-key-text transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-key-bg rounded-xl p-1">
          {[['gasto','Gasto'],['ingreso','Ingreso'],['presupuesto','Presupuesto']].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                tab === id ? 'bg-key-purple text-white' : 'text-key-muted'
              }`}>
              {label}
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs text-key-muted">
            {tab === 'presupuesto' ? 'Límite mensual ($)' : 'Monto ($)'}
          </label>
          <input className="input mt-1" type="number" placeholder="0"
            value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && save()} autoFocus />
        </div>

        <div>
          <label className="text-xs text-key-muted">Categoría</label>
          <select className="input mt-1" value={form.categoria}
            onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {tab !== 'presupuesto' && (
          <div>
            <label className="text-xs text-key-muted">Descripción (opcional)</label>
            <input className="input mt-1" placeholder="¿En qué?"
              value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
          </div>
        )}

        <div className="flex gap-3 pb-2">
          <button className="btn-ghost flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn-primary flex-1" onClick={save}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-key-card border border-key-border rounded-xl px-3 py-2 text-xs">
      <p className="text-key-text font-medium">{payload[0].name}</p>
      <p className="text-key-purple">${Number(payload[0].value).toLocaleString('es-CO')}</p>
    </div>
  )
}

export default function FinanzasScreen() {
  const { data } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [vista, setVista] = useState('resumen')

  const gastos = data.transacciones.filter(t => t.tipo === 'gasto')
  const ingresos = data.transacciones.filter(t => t.tipo === 'ingreso')
  const totalGastos = gastos.reduce((s, t) => s + t.monto, 0)
  const totalIngresos = ingresos.reduce((s, t) => s + t.monto, 0)
  const balance = totalIngresos - totalGastos

  const porCategoria = CATEGORIAS.map(cat => ({
    name: cat,
    value: gastos.filter(t => t.categoria === cat).reduce((s, t) => s + t.monto, 0),
    color: COLORES_CAT[cat]
  })).filter(c => c.value > 0)

  const presupData = data.presupuestos.map(p => ({
    name: p.categoria,
    presupuesto: p.limite,
    gastado: gastos.filter(t => t.categoria === p.categoria).reduce((s, t) => s + t.monto, 0),
    color: COLORES_CAT[p.categoria] || '#9d8ec4'
  }))

  return (
    <div className="px-4 pt-8 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-key-text">Finanzas</h1>
          <p className="text-key-muted text-sm">Este mes</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 py-2">
          <Plus size={16} /> <span className="text-sm">Agregar</span>
        </button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card text-center">
          <TrendingUp size={16} className="text-key-teal mx-auto mb-1" />
          <p className="text-xs text-key-muted">Ingresos</p>
          <p className="text-sm font-bold text-key-teal">${totalIngresos.toLocaleString('es-CO')}</p>
        </div>
        <div className="card text-center">
          <TrendingDown size={16} className="text-red-400 mx-auto mb-1" />
          <p className="text-xs text-key-muted">Gastos</p>
          <p className="text-sm font-bold text-red-400">${totalGastos.toLocaleString('es-CO')}</p>
        </div>
        <div className="card text-center">
          <Target size={16} className="text-key-purple mx-auto mb-1" />
          <p className="text-xs text-key-muted">Balance</p>
          <p className={`text-sm font-bold ${balance >= 0 ? 'text-key-teal' : 'text-red-400'}`}>
            ${Math.abs(balance).toLocaleString('es-CO')}
          </p>
        </div>
      </div>

      {/* Vista selector */}
      <div className="flex gap-1 bg-key-bg rounded-xl p-1">
        {[['resumen','Resumen'],['presupuesto','Presupuesto'],['historial','Historial']].map(([id,label]) => (
          <button key={id} onClick={() => setVista(id)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
              vista === id ? 'bg-key-purple text-white' : 'text-key-muted'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {vista === 'resumen' && (
        <div className="space-y-4">
          {porCategoria.length > 0 ? (
            <div className="card">
              <p className="text-xs text-key-muted mb-3">Gastos por categoría</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={porCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {porCategoria.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {porCategoria.map(c => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <span className="text-key-muted truncate">{c.name}</span>
                    <span className="text-key-text ml-auto">${c.value.toLocaleString('es-CO')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card text-center py-8">
              <p className="text-3xl mb-2">💸</p>
              <p className="text-key-muted text-sm">Sin gastos registrados aún</p>
            </div>
          )}
        </div>
      )}

      {vista === 'presupuesto' && (
        <div className="space-y-4">
          {presupData.length > 0 ? (
            <div className="card">
              <p className="text-xs text-key-muted mb-3">Presupuestado vs gastado</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={presupData} layout="vertical" margin={{ left: 60, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9d8ec4' }} tickFormatter={v => `$${v.toLocaleString('es-CO')}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9d8ec4' }} width={60} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="presupuesto" name="Presupuesto" fill="#2d1f4e" radius={4} />
                  <Bar dataKey="gastado" name="Gastado" radius={4}>
                    {presupData.map((entry, i) => (
                      <Cell key={i} fill={entry.gastado > entry.presupuesto ? '#ef4444' : entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {presupData.filter(p => p.gastado >= p.presupuesto * 0.8).map(p => (
                <div key={p.name} className={`mt-2 px-3 py-2 rounded-xl text-xs flex items-center gap-2 ${
                  p.gastado >= p.presupuesto ? 'bg-red-500/15 text-red-400' : 'bg-key-amber/15 text-key-amber'
                }`}>
                  {p.gastado >= p.presupuesto ? '🚨' : '⚠️'}
                  <span>
                    {p.gastado >= p.presupuesto
                      ? `¡Superaste el presupuesto de ${p.name}!`
                      : `Vas al ${Math.round((p.gastado/p.presupuesto)*100)}% del presupuesto de ${p.name}`
                    }
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-8 space-y-3">
              <p className="text-3xl">🎯</p>
              <p className="text-key-text font-medium">Sin presupuestos</p>
              <p className="text-key-muted text-sm">Agrega límites por categoría</p>
              <button className="btn-primary mx-auto" onClick={() => setShowModal(true)}>Crear presupuesto</button>
            </div>
          )}
        </div>
      )}

      {vista === 'historial' && (
        <div className="space-y-2">
          {data.transacciones.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-key-muted text-sm">Sin movimientos</p>
            </div>
          ) : (
            [...data.transacciones].reverse().map(t => (
              <div key={t.id} className="card flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: `${COLORES_CAT[t.categoria] || '#9d8ec4'}20` }}>
                  {t.tipo === 'gasto' ? '↗' : '↙'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-key-text">{t.descripcion || t.categoria}</p>
                  <p className="text-xs text-key-muted">{t.categoria} · {new Date(t.fecha).toLocaleDateString('es-CO')}</p>
                </div>
                <p className={`text-sm font-medium flex-shrink-0 ${t.tipo === 'gasto' ? 'text-red-400' : 'text-key-teal'}`}>
                  {t.tipo === 'gasto' ? '-' : '+'}${t.monto.toLocaleString('es-CO')}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && <AddModal onClose={() => setShowModal(false)} />}
    </div>
  )
}