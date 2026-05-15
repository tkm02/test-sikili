import { odooExecute } from './client'

/**
 * Recherche un product.product par nom exact.
 * Si inexistant, le crée avec un price standard correspondant au montant.
 *
 * Assumption documentée : on crée le produit à la volée si absent.
 * En production, on utiliserait une référence produit (SKU) stable.
 */
async function findOrCreateProduct(productName: string, price: number): Promise<number> {
  const existing = await odooExecute<number[]>('product.product', 'search', [
    [['name', '=', productName], ['active', '=', true]],
  ])

  if (existing.length > 0) {
    return existing[0]
  }

  const productId = await odooExecute<number>('product.product', 'create', [
    {
      name: productName,
      list_price: price,
      type: 'consu',        // consommable — pas de gestion de stock requise
      sale_ok: true,
      purchase_ok: false,
    },
  ])

  return productId
}

export interface OdooOrderData {
  partnerId: number
  productName: string
  amount: number
}

/**
 * Crée une sale.order dans Odoo avec une ligne de commande.
 * Utilise partner_id lié au res.partner créé côté client.
 */
export async function createOdooSaleOrder(data: OdooOrderData): Promise<number> {
  const productId = await findOrCreateProduct(data.productName, data.amount)

  const orderId = await odooExecute<number>('sale.order', 'create', [
    {
      partner_id: data.partnerId,
      order_line: [
        [
          0, // commande "create" dans le format ORM Odoo
          0,
          {
            product_id: productId,
            product_uom_qty: 1,
            price_unit: data.amount,
            name: data.productName,
          },
        ],
      ],
    },
  ])

  return orderId
}
