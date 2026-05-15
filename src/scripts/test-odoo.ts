/**
 * Script de validation de la connexion Odoo.
 * Exécuter avec : pnpm odoo:test
 *
 * Vérifie :
 * 1. Authentification XML-RPC
 * 2. Création d'un partenaire test
 * 3. Création d'une commande test
 * 4. Nettoyage (suppression) des entrées créées
 */
import { odooExecute, resetOdooAuth } from '../lib/odoo/client'
import { createOdooPartner } from '../lib/odoo/partners'
import { createOdooSaleOrder } from '../lib/odoo/orders'

async function main() {
  console.log('=== Test connexion Odoo ===')
  console.log(`URL: ${process.env.ODOO_URL}`)
  console.log(`DB:  ${process.env.ODOO_DB}`)
  console.log(`User: ${process.env.ODOO_USER}`)
  console.log('')

  // 1. Test auth
  console.log('1. Test authentification...')
  try {
    const version = await odooExecute<Record<string, string>>('res.partner', 'fields_get', [], {
      attributes: ['string'],
    })
    console.log('   ✓ Authentification réussie')
  } catch (err) {
    console.error('   ✗ Authentification échouée:', err)
    process.exit(1)
  }

  // 2. Créer un partenaire test
  console.log('2. Création partenaire test...')
  let partnerId: number
  try {
    partnerId = await createOdooPartner({
      name: '[TEST] Sikili Test Client',
      email: `test-${Date.now()}@sikili-test.local`,
      phone: '+221 77 000 0000',
    })
    console.log(`   ✓ Partenaire créé avec ID: ${partnerId}`)
  } catch (err) {
    console.error('   ✗ Création partenaire échouée:', err)
    process.exit(1)
  }

  // 3. Créer une commande test
  console.log('3. Création commande test...')
  let orderId: number
  try {
    orderId = await createOdooSaleOrder({
      partnerId,
      productName: '[TEST] Produit Sikili',
      amount: 25000,
    })
    console.log(`   ✓ Commande créée avec ID: ${orderId}`)
  } catch (err) {
    console.error('   ✗ Création commande échouée:', err)
    // Nettoyage du partenaire quand même
    await odooExecute('res.partner', 'unlink', [[partnerId]])
    process.exit(1)
  }

  // 4. Nettoyage
  console.log('4. Nettoyage des données test...')
  try {
    await odooExecute('sale.order', 'unlink', [[orderId]])
    await odooExecute('res.partner', 'unlink', [[partnerId]])
    console.log('   ✓ Données test supprimées')
  } catch (err) {
    console.warn('   ⚠ Nettoyage partiel (peut nécessiter suppression manuelle):', err)
  }

  console.log('')
  console.log('=== Tous les tests Odoo passent ✓ ===')
}

main().catch((err) => {
  console.error('Erreur fatale:', err)
  process.exit(1)
})
