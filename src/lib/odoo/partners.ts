import { odooExecute } from './client'

export interface OdooPartnerData {
  name: string
  email: string
  phone: string
}

/**
 * Crée un res.partner dans Odoo avec customer_rank=1.
 * customer_rank=1 est obligatoire pour que le contact apparaisse
 * dans la vue "Clients" du module Sales (pas seulement dans Contacts).
 */
export async function createOdooPartner(data: OdooPartnerData): Promise<number> {
  const partnerId = await odooExecute<number>('res.partner', 'create', [
    {
      name: data.name,
      email: data.email,
      phone: data.phone,
      customer_rank: 1,
    },
  ])

  return partnerId
}

/**
 * Vérifie si un partenaire existe déjà par email.
 * Retourne son ID ou null.
 */
export async function findOdooPartnerByEmail(email: string): Promise<number | null> {
  const results = await odooExecute<number[]>('res.partner', 'search', [
    [['email', '=', email]],
  ])

  return results.length > 0 ? results[0] : null
}
