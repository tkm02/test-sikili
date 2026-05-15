import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { db } from '@/lib/db'
import { createOdooPartner } from '@/lib/odoo/partners'
import { extractOdooErrorMessage } from '@/lib/odoo/errors'

const ClientSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(1, 'Le téléphone est requis'),
})

export async function GET() {
  const clients = await db.client.findMany({
    include: { orders: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = ClientSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { name, email, phone } = parsed.data

  // 1. Persister localement d'abord (principe offline-first / fiabilité)
  let client
  try {
    client = await db.client.create({
      data: { name, email, phone, syncStatus: 'PENDING' },
    })
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un client avec cet email existe déjà' },
        { status: 409 },
      )
    }
    throw err
  }

  // 2. Synchroniser avec Odoo de façon asynchrone mais dans la même requête
  try {
    const odooPartnerId = await createOdooPartner({ name, email, phone })

    const synced = await db.client.update({
      where: { id: client.id },
      data: { odooPartnerId, syncStatus: 'SYNCED', syncError: null },
    })

    return NextResponse.json(synced, { status: 201 })
  } catch (err) {
    const errorMessage = extractOdooErrorMessage(err)
    console.error(`[Odoo] Échec sync client #${client.id}:`, errorMessage)

    const failed = await db.client.update({
      where: { id: client.id },
      data: { syncStatus: 'FAILED', syncError: errorMessage },
    })

    // On retourne 201 quand même — le client est créé localement
    // Le statut FAILED indique que la sync Odoo a échoué
    return NextResponse.json(
      { ...failed, warning: 'Client créé localement mais sync Odoo échouée' },
      { status: 201 },
    )
  }
}
