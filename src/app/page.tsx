import { db } from '@/lib/db'
import { DeleteClientButton } from '@/components/DeleteClientButton'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'En attente',
  SYNCED: 'Synchronisé',
  FAILED: 'Échec sync',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#d97706',
  SYNCED: '#16a34a',
  FAILED: '#dc2626',
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const clients = await db.client.findMany({
    include: { orders: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>Clients ({clients.length})</h2>
        <a
          href="/clients/new"
          style={{
            background: '#2563eb',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
          }}
        >
          + Nouveau client
        </a>
      </div>

      {clients.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '48px 0' }}>
          Aucun client. <a href="/clients/new">Créer le premier client</a>
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Nom</th>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Téléphone</th>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Odoo ID</th>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Statut sync</th>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Commandes</th>
              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client: typeof clients[number]) => (
              <tr key={client.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 12px', fontWeight: '500' }}>{client.name}</td>
                <td style={{ padding: '10px 12px', color: '#6b7280' }}>{client.email}</td>
                <td style={{ padding: '10px 12px', color: '#6b7280' }}>{client.phone}</td>
                <td style={{ padding: '10px 12px', color: '#6b7280' }}>
                  {client.odooPartnerId ?? '—'}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span
                    style={{
                      color: STATUS_COLOR[client.syncStatus],
                      fontWeight: '500',
                      fontSize: '12px',
                    }}
                    title={client.syncError ?? undefined}
                  >
                    {STATUS_LABEL[client.syncStatus]}
                  </span>
                  {client.syncError && (
                    <span style={{ color: '#dc2626', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                      {client.syncError.slice(0, 60)}
                    </span>
                  )}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {client.orders.length > 0 ? (
                    <span>{client.orders.length} commande(s)</span>
                  ) : (
                    <a href={`/orders/new?clientId=${client.id}`} style={{ color: '#2563eb', fontSize: '12px' }}>
                      + Commande
                    </a>
                  )}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <DeleteClientButton id={client.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
