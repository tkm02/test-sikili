import { NextRequest, NextResponse } from 'next/server'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { db } from '@/lib/db'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const clientId = parseInt(id, 10)

  if (isNaN(clientId)) {
    return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
  }

  try {
    await db.client.delete({ where: { id: clientId } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    }
    throw err
  }
}
