# Utilisation de l'IA — Test technique Sikili

## Contexte

Ce fichier documente mes interactions avec Claude (Anthropic) lors de la réalisation de ce test technique. Conformément aux instructions du test, j'ai utilisé l'IA de façon transparente comme outil de productivité.

## Outil utilisé

**Claude Sonnet 4.6** via Claude Code (CLI Anthropic)

## Périmètre des interactions

### Ce que j'ai délégué à l'IA

1. **Génération du squelette initial** : structure de dossiers, fichiers de config (docker-compose, tsconfig, next.config)
2. **Prisma schema** : modèle de données basé sur mes specs (Client, Order, SyncStatus)
3. **Boilerplate de la couche Odoo** : wrapper XML-RPC, structure des fonctions `createOdooPartner` et `createOdooSaleOrder`
4. **Templates de formulaires** : HTML/React de base pour les pages "Nouveau client" et "Nouvelle commande"
5. **Structure du README** : outline initial que j'ai complété et ajusté

### Ce que j'ai fait moi-même

1. **Décisions architecturales** : choix d'isoler tout Odoo dans `src/lib/odoo/`, décision de persister localement avant de syncer, gestion du `syncStatus`
2. **Mapping Odoo** : recherche et validation des champs `res.partner`, `sale.order`, `sale.order.line`
3. **Logique métier** : décision du `customer_rank: 1`, format `[0, 0, {...}]` pour les lignes de commande
4. **Débogage** : test de la connexion XML-RPC, validation des credentials Odoo
5. **Révision complète** : lecture et validation de tout le code généré avant commit

## Philosophie d'utilisation

L'IA a accéléré la partie boilerplate (config, scaffolding, templates) qui représente ~30% du temps sur ce type de projet. Les décisions techniques critiques (architecture, mapping Odoo, gestion d'erreurs, syncStatus) restent de ma responsabilité.

Je considère l'IA comme un pair programming tool, pas un remplacement du jugement technique.

---

*Session réalisée le 10 mai 2026*
