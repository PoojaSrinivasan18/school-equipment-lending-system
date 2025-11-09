import { Equipment, RequestPayload } from '../types/api'
import api, { apiGet, apiPost, apiPut, apiDelete } from './api'

const EQUIP_KEY = 'mock:equipments'
const REQ_KEY = 'mock:requests'

const seedEquipments = (): Equipment[] => [
  { id: 1, name: 'Digital Camera', availableStock: 2, totalStock: 5, category: 'Cameras', description: 'DSLR camera for projects', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, name: 'Tripod', availableStock: 10, totalStock: 10, category: 'Accessories', description: 'Standard tripod', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 3, name: 'Projector', availableStock: 1, totalStock: 2, category: 'AV', description: 'HD projector', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
]

export async function getAllEquipments(): Promise<Equipment[]> {
  // If VITE_API_BASE_URL is set, you can implement a real fetch here.
  // For now, return mock data persisted in localStorage so UI changes persist across reloads.
  const base = (import.meta as any).env?.VITE_API_BASE_URL
  if (base) {
    const data = await apiGet<Equipment[]>('/equipments')
    return data
  }
  // fallback to local mock
  try {
    const raw = localStorage.getItem(EQUIP_KEY)
    if (raw) return JSON.parse(raw) as Equipment[]
  } catch {}
  const seeds = seedEquipments()
  try { localStorage.setItem(EQUIP_KEY, JSON.stringify(seeds)) } catch {}
  return seeds
}

export async function createRequest(payload: RequestPayload): Promise<RequestPayload> {
  // In production call POST /requests
  const base = (import.meta as any).env?.VITE_API_BASE_URL
  if (base) {
    const data = await apiPost<RequestPayload>('/requests', payload)
    return data
  }
  // fallback: local mock
  try {
    const raw = localStorage.getItem(REQ_KEY)
    const arr: RequestPayload[] = raw ? JSON.parse(raw) : []
    const nextId = arr.length ? Math.max(...arr.map(r => r.requestId || 0)) + 1 : 1
    const rec: RequestPayload = { ...payload, requestId: nextId, createdAt: new Date().toISOString(), status: 'PENDING'}
    arr.push(rec)
    localStorage.setItem(REQ_KEY, JSON.stringify(arr))

    // Decrement stock in equipments
    try {
      const eqRaw = localStorage.getItem(EQUIP_KEY)
      if (eqRaw) {
        const equips: Equipment[] = JSON.parse(eqRaw)
        const idx = equips.findIndex(e => e.id === payload.equipmentId)
        if (idx >= 0) {
          equips[idx].availableStock = Math.max(0, equips[idx].availableStock - payload.quantity)
          localStorage.setItem(EQUIP_KEY, JSON.stringify(equips))
        }
      }
    } catch {}

    return rec
  } catch (e) {
    throw new Error('failed to create request')
  }
}

export async function getMyRequests(userId: number): Promise<RequestPayload[]> {
  const base = (import.meta as any).env?.VITE_API_BASE_URL
  if (base) {
    const data = await apiGet<RequestPayload[]>('/requests/user', { params: { userId } })
    return data
  }
  try {
    const raw = localStorage.getItem(REQ_KEY)
    const arr: RequestPayload[] = raw ? JSON.parse(raw) : []
    return arr.filter(r => r.userId === userId)
  } catch {
    return []
  }
}

// Admin actions: create, delete, update equipment (API when VITE_API_BASE_URL present, otherwise mock)
export async function createEquipment(payload: Partial<Equipment>): Promise<Equipment> {
  const base = (import.meta as any).env?.VITE_API_BASE_URL
  if (base) {
    const data = await apiPost<Equipment, Partial<Equipment>>('/equipments', payload)
    return data
  }
  try {
    const raw = localStorage.getItem(EQUIP_KEY)
    const arr: Equipment[] = raw ? JSON.parse(raw) : []
    const nextId = arr.length ? Math.max(...arr.map(e => e.id)) + 1 : 1
    const now = new Date().toISOString()
    const rec: Equipment = {
      id: nextId,
      name: payload.name || 'New Equipment',
      availableStock: payload.availableStock ?? (payload.totalStock ?? 0),
      totalStock: payload.totalStock ?? (payload.availableStock ?? 0),
      category: payload.category || '',
      description: payload.description || '',
      createdAt: now,
      updatedAt: now,
    }
    arr.push(rec)
    localStorage.setItem(EQUIP_KEY, JSON.stringify(arr))
    return rec
  } catch (e) {
    throw new Error('failed to create equipment')
  }
}

export async function deleteEquipment(id: number): Promise<{ message: string }> {
  const base = (import.meta as any).env?.VITE_API_BASE_URL
  if (base) {
    const data = await apiDelete<{ message: string }>(`/equipments/${id}`)
    return data
  }
  try {
    const raw = localStorage.getItem(EQUIP_KEY)
    const arr: Equipment[] = raw ? JSON.parse(raw) : []
    const filtered = arr.filter(e => e.id !== id)
    localStorage.setItem(EQUIP_KEY, JSON.stringify(filtered))
    return { message: 'Equipment deleted' }
  } catch (e) {
    throw new Error('failed to delete equipment')
  }
}

export async function updateEquipment(id: number, updated: Partial<Equipment>): Promise<Equipment> {
  const base = (import.meta as any).env?.VITE_API_BASE_URL
  if (base) {
    const data = await apiPut<Equipment, Partial<Equipment>>(`/equipments/${id}`, updated)
    return data
  }
  try {
    const raw = localStorage.getItem(EQUIP_KEY)
    const arr: Equipment[] = raw ? JSON.parse(raw) : []
    const idx = arr.findIndex(e => e.id === id)
    if (idx < 0) throw new Error('not found')
    const now = new Date().toISOString()
    const merged = { ...arr[idx], ...updated, updatedAt: now }
    arr[idx] = merged
    localStorage.setItem(EQUIP_KEY, JSON.stringify(arr))
    return merged
  } catch (e) {
    throw new Error('failed to update equipment')
  }
}

// --- Admin: Get all pending requests ---
export async function getPendingRequests(): Promise<RequestPayload[]> {
  const base = (import.meta as any).env?.VITE_API_BASE_URL
  if (base) {
    // ✅ Updated to match backend route: GET /requests/status/pending
    const data = await apiGet<RequestPayload[]>('/requests/status/pending')
    return data
  }

  // Mock mode (localStorage)
  try {
    const raw = localStorage.getItem(REQ_KEY)
    const arr: RequestPayload[] = raw ? JSON.parse(raw) : []
    return arr.filter(r => (r.status || '').toLowerCase() === 'pending')
  } catch {
    return []
  }
}

// --- Admin: Approve a request ---
export async function approveRequest(requestId: number): Promise<RequestPayload> {
  const base = (import.meta as any).env?.VITE_API_BASE_URL
  if (base) {
    // ✅ Updated to use POST /requests/:id/approve
    const data = await apiPost<RequestPayload>(`/requests/${requestId}/approve`, {})
    return data
  }

  // Mock mode
  try {
    const raw = localStorage.getItem(REQ_KEY)
    const arr: RequestPayload[] = raw ? JSON.parse(raw) : []
    const idx = arr.findIndex(r => r.requestId === requestId)
    if (idx < 0) throw new Error('Request not found')

    const req = arr[idx]
    const now = new Date().toISOString()
    const updated: RequestPayload = { ...req, status: 'approved' }
    arr[idx] = updated
    localStorage.setItem(REQ_KEY, JSON.stringify(arr))

    // Decrement stock now (on approval)
    try {
      const eqRaw = localStorage.getItem(EQUIP_KEY)
      if (eqRaw) {
        const equips: Equipment[] = JSON.parse(eqRaw)
        const eqIdx = equips.findIndex(e => e.id === req.equipmentId)
        if (eqIdx >= 0) {
          equips[eqIdx].availableStock = Math.max(0, equips[eqIdx].availableStock - req.quantity)
          equips[eqIdx].updatedAt = now
          localStorage.setItem(EQUIP_KEY, JSON.stringify(equips))
        }
      }
    } catch {}
    return updated
  } catch {
    throw new Error('failed to approve request')
  }
}

// --- Admin: Reject a request ---
export async function rejectRequest(requestId: number): Promise<RequestPayload> {
  const base = (import.meta as any).env?.VITE_API_BASE_URL
  if (base) {
    // ✅ Updated to use POST /requests/:id/reject
    const data = await apiPost<RequestPayload>(`/requests/${requestId}/reject`, {})
    return data
  }

  // Mock mode
  try {
    const raw = localStorage.getItem(REQ_KEY)
    const arr: RequestPayload[] = raw ? JSON.parse(raw) : []
    const idx = arr.findIndex(r => r.requestId === requestId)
    if (idx < 0) throw new Error('Request not found')

    const req = arr[idx]
    const updated: RequestPayload = { ...req, status: 'rejected' }
    arr[idx] = updated
    localStorage.setItem(REQ_KEY, JSON.stringify(arr))
    return updated
  } catch {
    throw new Error('failed to reject request')
  }
}

export async function returnEquipment(requestId: number): Promise<RequestPayload> {
  const base = (import.meta as any).env?.VITE_API_BASE_URL
  if (base) {
    const data = await apiPost<RequestPayload>(`/requests/${requestId}/return`, {})
    return data
  }

  // Mock mode
  try {
    const raw = localStorage.getItem(REQ_KEY)
    const arr: RequestPayload[] = raw ? JSON.parse(raw) : []
    const idx = arr.findIndex(r => r.requestId === requestId)
    if (idx < 0) throw new Error('Request not found')

    const req = arr[idx]
    const now = new Date().toISOString()
    const updated: RequestPayload = { ...req, status: 'completed' }
    arr[idx] = updated
    localStorage.setItem(REQ_KEY, JSON.stringify(arr))

    // Increment stock back
    const eqRaw = localStorage.getItem(EQUIP_KEY)
    if (eqRaw) {
      const equips: Equipment[] = JSON.parse(eqRaw)
      const eqIdx = equips.findIndex(e => e.id === req.equipmentId)
      if (eqIdx >= 0) {
        equips[eqIdx].availableStock = equips[eqIdx].availableStock + req.quantity
        equips[eqIdx].updatedAt = now
        localStorage.setItem(EQUIP_KEY, JSON.stringify(equips))
      }
    }

    return updated
  } catch {
    throw new Error('failed to return equipment')
  }
}
