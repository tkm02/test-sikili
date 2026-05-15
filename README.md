# Sikili Odoo Sync — Technical Assessment

Synchronisation de clients et commandes entre une application web et Odoo 18.

## Stack

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Base de données | PostgreSQL 16 + Prisma |
| Intégration Odoo | XML-RPC (`xmlrpc` package) |
| Validation | Zod |
| Déploiement | Docker Compose |

## Architecture

```
src/
├── app/
│   ├── page.tsx                  ← Liste des clients + statut sync
│   ├── clients/new/page.tsx      ← Formulaire création client
│   ├── orders/new/page.tsx       ← Formulaire création commande
│   └── api/
│       ├── clients/route.ts      ← POST /api/clients
│       └── orders/route.ts       ← POST /api/orders
└── lib/
    ├── db.ts                     ← Singleton Prisma
    └── odoo/                     ← SERVICE LAYER ISOLÉ
        ├── client.ts             ← XML-RPC wrapper (authenticate + execute)
        ├── partners.ts           ← createOdooPartner()
        ├── orders.ts             ← createOdooSaleOrder()
        └── errors.ts             ← Types d'erreurs Odoo
```

**Principe clé** : toute la logique Odoo est isolée dans `src/lib/odoo/`. Aucun appel XML-RPC dans les routes ou les composants.

## Lancer localement

### Prérequis

- Docker + Docker Compose
- Node.js 20+ et pnpm (pour dev local sans Docker)

### Avec Docker (recommandé)

```bash
# 1. Copier les variables d'environnement
cp .env.example .env

# 2. Lancer tous les services
docker compose up -d

# 3. Attendre qu'Odoo soit prêt (~60-90 secondes)
# Ouvrir http://localhost:8069
# → Créer la base de données "sikili"
# → Installer les modules : Sales et Invoicing

# 4. Mettre à jour .env avec les credentials Odoo choisis
# ODOO_DB=sikili
# ODOO_USER=admin
# ODOO_PASSWORD=<votre mot de passe admin>

# 5. Redémarrer le service app pour appliquer les migrations
docker compose restart app

# Application disponible sur http://localhost:3000
```

### En développement local (sans Docker app)

```bash
# Lancer uniquement Odoo + PostgreSQL
docker compose up -d odoo-db odoo app-db

# Installer les dépendances
pnpm install

# Copier et configurer l'env
cp .env.example .env
# → DATABASE_URL=postgresql://app:app@localhost:5432/app
# → ODOO_URL=http://localhost:8069
# → ODOO_DB=sikili
# → ODOO_USER=admin@example.com
# → ODOO_PASSWORD=<mot de passe admin>

# Lancer les migrations et générer le client Prisma
pnpm prisma migrate dev

# Valider la connexion Odoo
pnpm odoo:test

# Lancer le serveur de développement
pnpm dev
```

## Credentials Odoo pour le reviewer

| Paramètre | Valeur |
|---|---|
| URL | http://localhost:8069 |
| Base de données | sikili |
| Utilisateur | admin@example.com |
| Mot de passe | *(défini lors de l'init de la DB Odoo)* |

## Objets Odoo utilisés

### `res.partner` → Clients

Le modèle natif d'Odoo pour les contacts et clients. On crée un partenaire avec `customer_rank: 1`, ce qui est obligatoire pour qu'il apparaisse dans la vue "Clients" du module Sales (sans ce flag, il n'est visible que dans Contacts).

Champs mappés :

| App | Odoo |
|---|---|
| `name` | `name` |
| `email` | `email` |
| `phone` | `phone` |
| *(fixe)* | `customer_rank: 1` |

### `sale.order` + `sale.order.line` → Commandes

Le bon de commande natif d'Odoo. Une commande de l'app = une `sale.order` avec une seule ligne (`sale.order.line`). Le lien avec le client se fait via `partner_id`.

Le format `[0, 0, {...}]` dans `order_line` est la syntaxe ORM d'Odoo pour créer un enregistrement lié à la volée (opération "CREATE").

### `product.product` → Produits

**Assumption documentée** : les produits sont créés à la volée par nom si inexistants. En production, on utiliserait une référence produit (SKU) stable et une sélection depuis un catalogue.

## Modèle de données local

```
Client
  id, name, email, phone
  odooPartnerId   → ID du res.partner dans Odoo (null si non synced)
  syncStatus      → PENDING | SYNCED | FAILED
  syncError       → Message d'erreur si FAILED

Order
  id, clientId, productName, amount
  odooOrderId     → ID de la sale.order dans Odoo (null si non synced)
  syncStatus      → PENDING | SYNCED | FAILED
  syncError       → Message d'erreur si FAILED
```

Le champ `syncStatus` est central : on persiste toujours localement avant de tenter la sync Odoo. En cas d'échec Odoo, l'enregistrement local est conservé avec le statut `FAILED` pour permettre un retry manuel.

## Flux de synchronisation

```
POST /api/clients
  1. Validation Zod
  2. INSERT en base locale (syncStatus=PENDING)
  3. Appel Odoo XML-RPC → createPartner()
     → Succès : UPDATE syncStatus=SYNCED, odooPartnerId
     → Échec   : UPDATE syncStatus=FAILED, syncError=message
  4. Retour 201 dans les deux cas (local est toujours créé)
```

## Assumptions et simplifications

- **Création seulement** : pas de sync en mise à jour ni en suppression
- **Produits à la volée** : créés au premier usage, sans gestion de SKU ni catalogue
- **Pas de retry automatique** : les entrées FAILED nécessitent une intervention manuelle
- **Devise unique** : XOF (Franc CFA) implicite, pas de multi-devise
- **Pas d'auth app** : l'interface web est ouverte (hors scope du test)
- **Cache UID Odoo** : l'authentification XML-RPC est mise en cache en mémoire process (reset automatique au redémarrage)

## Ce que j'améliorerais avec plus de temps

- **Queue de jobs** (BullMQ ou pg-boss) pour sync asynchrone avec retry exponentiel
- **Webhook Odoo → app** pour sync inverse (changements côté Odoo reflétés dans l'app)
- **Idempotency keys** pour éviter les doublons en cas de retry
- **Tests unitaires** sur la couche `src/lib/odoo/` avec mock du client XML-RPC
- **Auth** sur l'interface web
- **UI** avec Tailwind ou shadcn/ui pour un rendu production-ready

## Utilisation de l'IA

Voir [`ai-session.md`](./ai-session.md) pour le détail des interactions.
