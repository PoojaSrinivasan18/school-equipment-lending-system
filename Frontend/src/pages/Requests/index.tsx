import React, { useEffect, useState } from 'react'
import { createEquipment, deleteEquipment, updateEquipment, getAllEquipments } from '../../services/equipmentService'
import type { Equipment } from '../../types/api'
import { useAuth } from '../../hooks/useAuth'

export default function EditEquipmentsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({ name: '', category: '', totalStock: 1, description: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await getAllEquipments()
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload: Partial<Equipment> = {
        name: form.name,
        category: form.category,
        totalStock: form.totalStock,
        availableStock: form.totalStock,
        description: form.description,
      }
      await createEquipment(payload)
      setForm({ name: '', category: '', totalStock: 1, description: '' })
      await load()
    } catch (err) {
      // ignore for now
      console.error(err)
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this equipment?')) return
    await deleteEquipment(id)
    await load()
  }

  async function onSaveEdit(id: number, partial: Partial<Equipment>) {
    await updateEquipment(id, partial)
    setEditingId(null)
    await load()
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card">
          <h2 className="text-lg font-semibold">Not authorized</h2>
          <div className="mt-2 text-sm text-gray-600">Requests page is for administrators only.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-semibold mb-4">Edit Equipments</h2>

        <div className="card mb-4">
          <form onSubmit={onAdd} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Category</label>
              <input className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Total Stock</label>
              <input type="number" min={0} className="input" value={form.totalStock} onChange={e => setForm(f => ({ ...f, totalStock: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Description</label>
              <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="submit" className="btn btn-primary">Add Equipment</button>
            </div>
          </form>
        </div>

        {loading ? <div>Loading...</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className="card">
                {editingId === item.id ? (
                  <EditItem item={item} onCancel={() => setEditingId(null)} onSave={(p) => onSaveEdit(item.id, p)} />
                ) : (
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <div className="text-sm text-gray-600">{item.category}</div>
                    <div className="mb-2 mt-2 text-sm">{item.description}</div>
                    <div className="flex items-center justify-between">
                      <div>Available: <strong>{item.availableStock}</strong></div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingId(item.id)} className="px-3 py-1 border rounded">Edit</button>
                        <button onClick={() => onDelete(item.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EditItem({ item, onCancel, onSave }: { item: Equipment; onCancel: () => void; onSave: (p: Partial<Equipment>) => void }) {
  const [state, setState] = useState<Partial<Equipment>>({ name: item.name, category: item.category, totalStock: item.totalStock, availableStock: item.availableStock, description: item.description })
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(state) }} className="space-y-2">
      <input className="input" value={state.name || ''} onChange={e => setState(s => ({ ...s, name: e.target.value }))} />
      <input className="input" value={state.category || ''} onChange={e => setState(s => ({ ...s, category: e.target.value }))} />
      <input type="number" className="input" value={state.totalStock ?? 0} onChange={e => setState(s => ({ ...s, totalStock: Number(e.target.value) }))} />
      <input type="number" className="input" value={state.availableStock ?? 0} onChange={e => setState(s => ({ ...s, availableStock: Number(e.target.value) }))} />
      <textarea className="input" value={state.description || ''} onChange={e => setState(s => ({ ...s, description: e.target.value }))} />
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
    </form>
  )
}
