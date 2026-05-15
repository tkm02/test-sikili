'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteClientButton({ id }: { id: number | string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Supprimer ce client ? Cette action est irréversible.')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        alert(json.error ?? 'Erreur lors de la suppression')
        return
      }
      router.refresh()
    } catch {
      alert('Erreur réseau — réessayez')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        background: 'none',
        border: '1px solid #fca5a5',
        color: '#dc2626',
        padding: '4px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? '...' : 'Supprimer'}
    </button>
  )
}
