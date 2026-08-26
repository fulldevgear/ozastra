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
statique pour chaque route publique. La cible active est GitHub Pages :

```bash
VITE_SITE_URL=https://ozastra.com pnpm build:pages
```

Cette commande prépare `.output/public`, ajoute le fallback `404.html` et
désactive le traitement Jekyll. Seul ce répertoire est publié.

## Production GitHub Pages

Le workflow `.github/workflows/deploy-pages.yml` valide la roadmap, les
traductions, le typage, le lint, les tests et les budgets avant chaque
publication depuis `master` ou `main`. GitHub Pages héberge le site ;
Cloudflare ne gère que les enregistrements DNS de `ozastra.com`.

Le formulaire ne transmet rien à une API : il prépare un brouillon dans
l’application de messagerie du visiteur. Les analytics sont désactivés et
aucun secret n’est nécessaire pour cette version vitrine.

Après publication :

```bash
OZASTRA_SMOKE_BASE_URL=https://ozastra.com pnpm smoke:pages
```

La procédure complète de publication, DNS, HTTPS et rollback est décrite dans
[`docs/deployment-runbook.md`](docs/deployment-runbook.md).

## Runtime Node / Docker différé

Le runtime Nitro, les routes API, Docker et Caddy sont conservés uniquement
comme option future. Ils ne font pas partie du lancement GitHub Pages actuel.

```bash
pnpm build
pnpm start

cp .env.production.example .env.production
docker compose --env-file .env.production -f compose.production.yaml up --build
```

## Roadmap obligatoire

`paradigm-roadmap.json` est la source de vérité créative et technique. Tout
livrable doit être commencé, terminé ou bloqué avec
`scripts/update-roadmap.mjs`. Les commandes exactes figurent dans `AGENTS.md`.

## Variables d’environnement du runtime différé

- `VITE_SITE_URL` : origine publique utilisée pour les URL canoniques.
- `CONTACT_RECIPIENT` : adresse recevant les demandes de contact.
- `CONTACT_SENDER` : identité d’envoi autorisée chez le fournisseur email.
- `CONTACT_PROVIDER_API_KEY` : secret du fournisseur de transport.
- `CONTACT_RATE_LIMIT_MAX` : nombre maximal de demandes par fenêtre.
- `CONTACT_RATE_LIMIT_WINDOW_SECONDS` : durée de la fenêtre anti-abus.

Ne jamais préfixer une variable secrète avec `VITE_`, car elle serait alors
exposée au navigateur. Aucune de ces variables secrètes n’est installée sur
GitHub Pages.
