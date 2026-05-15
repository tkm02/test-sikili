import { odooExecute } from './client'

export interface OdooPartnerData {
  name: string
  email: string
  phone: string
}

/**
 * Crée un res.partner dans Odoo avec les champs compatibles les plus basiques.
 * On évite d'envoyer des champs dépendants d'une version/module précis.
 */
export async function createOdooPartner(data: OdooPartnerData): Promise<number> {
  const partnerId = await odooExecute<number>('res.partner', 'create', [
    {
      name: data.name,
      email: data.email,
      phone: data.phone,
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
