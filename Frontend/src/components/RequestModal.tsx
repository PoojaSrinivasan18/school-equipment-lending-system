import React, { useState, useEffect } from 'react'
import type { Equipment } from '../types/api'

type Props = {
  open: boolean
  equipment: Equipment | null
  onClose: () => void
  onSubmit: (data: { quantity: number; borrowDate?: string; remarks?: string }) => Promise<void>
}

export default function RequestModal({ open, equipment, onClose, onSubmit }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [borrowDate, setBorrowDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (equipment) {
      setQuantity(1)
      setBorrowDate(new Date().toISOString().slice(0, 10))
      setRemarks('')
      setError(null)
    }
  }, [equipment])

  if (!open || !equipment) return null

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    if (!Number.isInteger(quantity) || quantity <= 0) return setError('Quantity must be a positive integer')
    if (quantity > equipment.availableStock) return setError('Requested quantity exceeds available stock')
    setLoading(true)
    try {
      await onSubmit({ quantity, borrowDate, remarks })
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to create request')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="modal-panel">
        <h3 className="text-lg font-semibold mb-3">Request {equipment.name}</h3>
        <div className="mb-3">
          <label className="block text-sm mb-1">Quantity (available: {equipment.availableStock})</label>
          <input type="number" min={1} max={equipment.availableStock} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="input" />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Borrow date</label>
          <input type="date" value={borrowDate} onChange={e => setBorrowDate(e.target.value)} className="input" />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Remarks (optional)</label>
          <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="input" />
        </div>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Requesting...' : 'Request'}</button>
        </div>
      </form>
    </div>
  )
}
