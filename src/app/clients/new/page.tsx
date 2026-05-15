'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setWarning(null)

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
    }

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Erreur lors de la création du client')
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
      <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Nouveau client</h2>

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
          <label htmlFor="name" style={labelStyle}>Nom complet</label>
          <input id="name" name="name" type="text" required style={inputStyle} placeholder="Aminata Diallo" />
        </div>

        <div>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input id="email" name="email" type="email" required style={inputStyle} placeholder="aminata@exemple.sn" />
        </div>

        <div>
          <label htmlFor="phone" style={labelStyle}>Téléphone</label>
          <input id="phone" name="phone" type="tel" required style={inputStyle} placeholder="+221 77 000 0000" />
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
            {loading ? 'Création + sync Odoo...' : 'Créer le client'}
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
