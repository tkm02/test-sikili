'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface Client {
  id: number
  name: string
  email: string
  syncStatus: string
  odooPartnerId: number | null
}

function NewOrderForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedClientId = searchParams.get('clientId')

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then(setClients)
      .catch(() => setError('Impossible de charger les clients'))
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setWarning(null)

    const form = e.currentTarget
    const data = {
      clientId: parseInt((form.elements.namedItem('clientId') as HTMLSelectElement).value),
      productName: (form.elements.namedItem('productName') as HTMLInputElement).value,
      amount: parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value),
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Erreur lors de la création de la commande')
        return
      }

      if (json.warning) {
        setWarning(json.warning)
        setTimeout(() => router.push('/'), 2000)
        return
      }

      router.push('/')
    } catch {
      setError('Erreur réseau — réessayez')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    marginTop: '4px',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  }

  return (
    <div style={{ maxWidth: '480px' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Nouvelle commande</h2>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {warning && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', color: '#d97706', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
          {warning} — redirection en cours...
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="clientId" style={labelStyle}>Client</label>
          <select
            id="clientId"
            name="clientId"
            required
            defaultValue={preselectedClientId ?? ''}
            style={inputStyle}
          >
            <option value="">Sélectionner un client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
                {c.syncStatus !== 'SYNCED' ? ' ⚠ non sync Odoo' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="productName" style={labelStyle}>Nom du produit / service</label>
          <input
            id="productName"
            name="productName"
            type="text"
            required
            style={inputStyle}
            placeholder="Abonnement mensuel Pro"
          />
        </div>

        <div>
          <label htmlFor="amount" style={labelStyle}>Montant (XOF)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            style={inputStyle}
            placeholder="25000"
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#93c5fd' : '#2563eb',
              color: 'white',
              padding: '10px 24px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
            }}
          >
            {loading ? 'Création + sync Odoo...' : 'Créer la commande'}
          </button>

          <a
            href="/"
            style={{
              padding: '10px 24px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#374151',
              textDecoration: 'none',
            }}
          >
            Annuler
          </a>
        </div>
      </form>
    </div>
  )
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<p>Chargement...</p>}>
      <NewOrderForm />
    </Suspense>
  )
}
