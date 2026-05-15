import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createOdooSaleOrder } from '@/lib/odoo/orders'
import { extractOdooErrorMessage } from '@/lib/odoo/errors'

const OrderSchema = z.object({
  clientId: z.number().int().positive('ID client invalide'),
  productName: z.string().min(1, 'Le nom du produit est requis'),
  amount: z.number().positive('Le montant doit être positif'),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = OrderSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { clientId, productName, amount } = parsed.data

  // Vérifier que le client existe et récupérer son odooPartnerId
  const client = await db.client.findUnique({ where: { id: clientId } })

  if (!client) {
    return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
  }

  // 1. Persister localement
  const order = await db.order.create({
    data: { clientId, productName, amount, syncStatus: 'PENDING' },
  })

  // 2. Synchroniser avec Odoo si le partenaire existe dans Odoo
  if (!client.odooPartnerId) {
    const failed = await db.order.update({
      where: { id: order.id },
      data: {
        syncStatus: 'FAILED',
        syncError: 'Le client associé n\'est pas synchronisé avec Odoo',
      },
    })

    return NextResponse.json(
      { ...failed, warning: 'Commande créée localement — client non synchronisé Odoo' },
      { status: 201 },
    )
  }

  try {
    const odooOrderId = await createOdooSaleOrder({
      partnerId: client.odooPartnerId,
      productName,
      amount,
    })

    const synced = await db.order.update({
      where: { id: order.id },
      data: { odooOrderId, syncStatus: 'SYNCED', syncError: null },
    })

    return NextResponse.json(synced, { status: 201 })
  } catch (err) {
    const errorMessage = extractOdooErrorMessage(err)
    console.error(`[Odoo] Échec sync commande #${order.id}:`, errorMessage)

    const failed = await db.order.update({
      where: { id: order.id },
      data: { syncStatus: 'FAILED', syncError: errorMessage },
    })

    return NextResponse.json(
      { ...failed, warning: 'Commande créée localement mais sync Odoo échouée' },
      { status: 201 },
    )
  }
}
