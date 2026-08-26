# Ozastra — GitHub Pages, domaine et rollback

Ce runbook décrit la cible active du site vitrine : un artefact entièrement
statique publié par GitHub Actions sur GitHub Pages. Cloudflare reste le
gestionnaire DNS de `ozastra.com`. Aucun VPS, conteneur ou secret applicatif
n’est utilisé.

## 1. Pré-requis

- dépôt GitHub administré par le compte qui publie Ozastra ;
- GitHub Pages configuré avec la source **GitHub Actions** ;
- accès à la zone DNS Cloudflare `ozastra.com` ;
- informations légales réelles de la LLC complétées avant le lancement final ;
- validation du candidat sur un iPhone et un second mobile réel.

Le formulaire statique prépare un brouillon adressé à `hello@ozastra.com` dans
l’application de messagerie du visiteur. Il ne collecte rien sur le site et ne
requiert aucun secret. Les analytics first-party et les routes `/api/*` ne sont
pas publiés.

## 2. Préflight local

Depuis une copie propre et identifiée du code :

```bash
pnpm install --frozen-lockfile
pnpm roadmap:validate
pnpm i18n:validate
pnpm lint
pnpm typecheck
pnpm test
VITE_SITE_URL=https://ozastra.com pnpm build:pages
pnpm check:bundle
```

L’artefact à publier est exclusivement `.output/public`. Il doit contenir les
18 pages localisées, les assets techniques, `404.html` et `.nojekyll`.

## 3. Publication GitHub Pages

1. Pousser un commit validé sur `master` ou `main`.
2. Attendre le succès du workflow **Deploy GitHub Pages**.
3. Dans **Settings → Pages**, sélectionner **GitHub Actions** comme source.
4. Vérifier le domaine `ozastra.com` au niveau du compte GitHub et conserver le
   TXT de vérification dans Cloudflare.
5. Ajouter `ozastra.com` comme domaine personnalisé du site Pages avant de
   modifier les enregistrements de destination.

Le workflow utilise uniquement les permissions `contents: read`, `pages:
write` et `id-token: write`. Il ne contient aucun secret de production.

## 4. DNS Cloudflare

Créer les enregistrements GitHub Pages sans proxy Cloudflare pendant
l’émission initiale du certificat :

- quatre enregistrements `A` pour `@` vers `185.199.108.153`,
  `185.199.109.153`, `185.199.110.153` et `185.199.111.153` ;
- quatre enregistrements `AAAA` pour `@` vers `2606:50c0:8000::153`,
  `2606:50c0:8001::153`, `2606:50c0:8002::153` et
  `2606:50c0:8003::153` ;
- un `CNAME` `www` vers `fulldevgear.github.io` ;
- le TXT de vérification GitHub, conservé durablement.

Ne créer aucun wildcard. Supprimer tout ancien A, AAAA ou CNAME concurrent
pour `@` ou `www` avant la bascule.

## 5. HTTPS et validation publique

Une fois le contrôle DNS GitHub réussi, activer **Enforce HTTPS** dans les
réglages Pages. Puis lancer :

```bash
OZASTRA_SMOKE_BASE_URL=https://ozastra.com pnpm smoke:pages
```

Vérifier aussi :

- la redirection de `www` vers le domaine principal ;
- les versions anglaise et française ;
- les pages projets, favicon, manifeste, sitemap et image Open Graph ;
- le formulaire sur desktop et mobile ;
- l’absence d’appels `/api/analytics` et de cookies applicatifs ;
- le statut du workflow et la disponibilité du domaine pendant 30 minutes.

GitHub Pages ne permet pas de définir les en-têtes HTTP personnalisés de
l’ancien runtime Caddy. Cette limite est acceptée pour la version statique,
sans données ni secrets ; HTTPS reste obligatoire.

## 6. Rollback

1. Identifier le dernier commit dont le workflow Pages était vert.
2. Revenir au contenu précédent avec un nouveau commit de revert, sans réécrire
   l’historique Git.
3. Pousser ce commit et attendre le nouveau déploiement Pages.
4. Relancer `pnpm smoke:pages` contre `https://ozastra.com`.
5. Consigner le commit fautif, le commit restauré, l’heure et le résultat.

Le DNS ne doit pas être modifié pour un rollback applicatif. Si la cible
d’hébergement change un jour, conserver d’abord les anciens enregistrements et
leur TTL dans le journal de release afin de pouvoir les restaurer séparément.
