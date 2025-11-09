export interface User {
  id: number
  name: string
  email: string
  password?: string
  role?: 'borrower' | 'admin' | 'inventory'
  createdAt?: string
  updatedAt?: string
}

export interface Equipment {
  id: number
  name: string
  availableStock: number
  totalStock: number
  category?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface RequestPayload {
  requestId?: number
  userId: number
  username?: string
  equipmentId: number
  quantity: number
  createdAt?: string
  borrowDate?: string
  remarks?: string
}
