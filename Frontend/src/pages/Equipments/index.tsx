import React, { useEffect, useState } from 'react'
import { getAllEquipments, createRequest } from '../../services/equipmentService'
import type { Equipment } from '../../types/api'
import { useAuth } from '../../hooks/useAuth'
import RequestModal from '../../components/RequestModal'

function EquipmentCard({ e, onRequest, isAdmin }: { e: Equipment; onRequest: (id: number) => void; isAdmin: boolean }) {
  return (
    <div className="card card-hover flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-lg">{e.name}</h3>
        <div className="text-sm text-gray-600 mb-2">{e.category}</div>
        <div className="mb-2">{e.description}</div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="">Available: <span className="font-medium">{e.availableStock}</span></div>
        {!isAdmin && (
          <button disabled={e.availableStock <= 0} onClick={() => onRequest(e.id)} className="px-3 py-1 btn btn-primary disabled:opacity-50">
            Request
          </button>
        )}
      </div>
    </div>
  )
}

export default function EquipmentsPage() {
  const [items, setItems] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const [selectedEquip, setSelectedEquip] = useState<Equipment | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    getAllEquipments().then(data => setItems(data)).finally(() => setLoading(false))
  }, [])

  const openRequest = (id: number) => {
    const e = items.find(x => x.id === id) || null
    setSelectedEquip(e)
    setModalOpen(true)
  }

  const handleSubmit = async (data: { quantity: number; borrowDate?: string; remarks?: string }) => {
    if (!user) return alert('Please login')
    if (!selectedEquip) return
    await createRequest({ userId: user.id, username: user.name, equipmentId: selectedEquip.id, quantity: data.quantity, borrowDate: data.borrowDate, remarks: data.remarks })
    const refreshed = await getAllEquipments()
    setItems(refreshed)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-semibold mb-4">Equipments</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(e => <EquipmentCard key={e.id} e={e} onRequest={openRequest} isAdmin={Boolean(user?.role === 'admin')} />)}
          </div>
        )}
      </div>
      <RequestModal open={modalOpen} equipment={selectedEquip} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
    </div>
  )
}
