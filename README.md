# Ozastra

Site vitrine d’Ozastra LLC construit avec TanStack Start, React, TypeScript,
Tailwind CSS, React Three Fiber et GSAP.

## Pré-requis

- Node.js 22.13 ou supérieur (Node.js 24 en production)
- pnpm 11.20.0

## Démarrage

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Le site est ensuite disponible sur `http://localhost:3000`.

## Vérifications

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm roadmap:validate
```

Le build active le pré-rendu TanStack Start et doit produire un fichier HTML
statique pour chaque route publique.

## Production Node / Docker

Le build Nitro génère un serveur Node autonome dans `.output`. Il peut être
lancé directement ou via l’image Docker non-root :

```bash
pnpm build
pnpm start

cp .env.production.example .env.production
docker compose --env-file .env.production -f compose.production.yaml up --build
```

`compose.production.yaml` place Caddy devant l’application pour HTTPS,
compression et cache des assets. Le healthcheck public est disponible sur
`/api/health`. Après un déploiement, lancer le contrôle automatisé :

```bash
OZASTRA_SMOKE_BASE_URL=https://ozastra.com pnpm smoke:production
```

La procédure complète de release, surveillance et restauration est décrite
dans [`docs/deployment-runbook.md`](docs/deployment-runbook.md).

## Roadmap obligatoire

`paradigm-roadmap.json` est la source de vérité créative et technique. Tout
livrable doit être commencé, terminé ou bloqué avec
`scripts/update-roadmap.mjs`. Les commandes exactes figurent dans `AGENTS.md`.

## Variables d’environnement

- `VITE_SITE_URL` : origine publique utilisée pour les URL canoniques.
- `CONTACT_RECIPIENT` : adresse recevant les demandes de contact.
- `CONTACT_SENDER` : identité d’envoi autorisée chez le fournisseur email.
- `CONTACT_PROVIDER_API_KEY` : secret du fournisseur de transport.
- `CONTACT_RATE_LIMIT_MAX` : nombre maximal de demandes par fenêtre.
- `CONTACT_RATE_LIMIT_WINDOW_SECONDS` : durée de la fenêtre anti-abus.

Ne jamais préfixer une variable secrète avec `VITE_`, car elle serait alors
exposée au navigateur.
