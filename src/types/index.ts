export type SyncStatus = 'PENDING' | 'SYNCED' | 'FAILED'

export interface ClientInput {
  name: string
  email: string
  phone: string
}

export interface OrderInput {
  clientId: number
  productName: string
  amount: number
}

export interface ClientWithOrders {
  id: number
  name: string
  email: string
  phone: string
  odooPartnerId: number | null
  syncStatus: SyncStatus
  syncError: string | null
  createdAt: Date
  orders: {
    id: number
    productName: string
    amount: string
    odooOrderId: number | null
    syncStatus: SyncStatus
    syncError: string | null
    createdAt: Date
  }[]
}
