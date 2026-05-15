import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sikili Odoo Sync',
  description: 'Test technique — synchronisation clients/commandes avec Odoo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        <header style={{ marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Sikili Odoo Sync</h1>
          <nav style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
            <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Clients</a>
            <a href="/clients/new" style={{ color: '#2563eb', textDecoration: 'none' }}>+ Nouveau client</a>
            <a href="/orders/new" style={{ color: '#2563eb', textDecoration: 'none' }}>+ Nouvelle commande</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
