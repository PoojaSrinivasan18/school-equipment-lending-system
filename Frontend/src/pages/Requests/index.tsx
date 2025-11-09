import React, { useEffect, useState } from 'react'
import {
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getAllEquipments,
  getMyRequests,
  returnEquipment // 👈 new import
} from '../../services/equipmentService'
import type { RequestPayload, Equipment } from '../../types/api'
import { useAuth } from '../../hooks/useAuth'

export default function AdminRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<RequestPayload[]>([])
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    if (user) load()
  }, [user])

  async function load() {
    if (!user) return
    setLoading(true)
    try {
      const [reqs, eqs] = await Promise.all([
        user.role === 'admin' ? getPendingRequests() : getMyRequests(user.id),
        getAllEquipments()
      ])
      setRequests(reqs)
      setEquipments(eqs)
    } finally {
      setLoading(false)
    }
  }

  function getEquipmentName(id: number): string {
    const eq = equipments.find(e => e.id === id)
    return eq ? eq.name : `Equipment #${id}`
  }

  async function handleApprove(id: number) {
    setActionLoading(id)
    try {
      await approveRequest(id)
      await load()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id: number) {
    setActionLoading(id)
    try {
      await rejectRequest(id)
      await load()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  // 👇 new function for users to return approved equipment
  async function handleReturn(id: number) {
    setActionLoading(id)
    try {
      await returnEquipment(id)
      await load()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <h2 className="text-lg font-semibold">Please log in</h2>
          <p className="mt-2 text-sm text-gray-600">
            You must be logged in to view your requests.
          </p>
        </div>
      </div>
    )
  }

  const isAdmin = user.role === 'admin'
  const title = isAdmin
    ? 'Pending Equipment Requests'
    : 'My Equipment Requests'

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>

        {loading ? (
          <div>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-gray-600 text-sm">
            No {isAdmin ? 'pending' : 'submitted'} requests found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map(req => (
              <div
                key={req.requestId}
                className="card flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-lg mb-1">{req.username}</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    Requested:{' '}
                    <strong>{getEquipmentName(req.equipmentId)}</strong>
                  </div>
                  <div className="text-sm mb-1">
                    Quantity: <strong>{req.quantity}</strong>
                  </div>
                  <div className="text-sm mb-1">
                    Borrow Date: <strong>{req.borrowDate}</strong>
                  </div>
                  <div className="text-sm mb-1">
                    Remarks: {req.remarks || <em>None</em>}
                  </div>
                  <div className="text-sm mb-1">
                    Status: <strong>{req.status}</strong>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Created at:{' '}
                    {req.createdAt
                      ? new Date(req.createdAt).toLocaleString()
                      : 'N/A'}
                  </div>
                </div>

                {/* --- ADMIN ACTIONS --- */}
                {isAdmin && req.requestId !== undefined && (
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => handleApprove(req.requestId!)}
                      disabled={actionLoading === req.requestId}
                      className="btn btn-primary"
                    >
                      {actionLoading === req.requestId
                        ? 'Approving...'
                        : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(req.requestId!)}
                      disabled={actionLoading === req.requestId}
                      className="btn bg-red-600 text-white"
                    >
                      {actionLoading === req.requestId
                        ? 'Rejecting...'
                        : 'Reject'}
                    </button>
                  </div>
                )}

                {/* --- USER ACTIONS: RETURN EQUIPMENT --- */}
                {!isAdmin &&
                  req.requestId !== undefined &&
                  req.status?.toUpperCase() === 'APPROVED' && (
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => handleReturn(req.requestId!)}
                        disabled={actionLoading === req.requestId}
                        className="btn bg-yellow-500 text-white"
                      >
                        {actionLoading === req.requestId
                          ? 'Returning...'
                          : 'Return Equipment'}
                      </button>
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
