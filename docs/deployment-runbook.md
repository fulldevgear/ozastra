# Ozastra — Runbook de déploiement et rollback

Ce document décrit le lancement du serveur TanStack Start/Nitro derrière Caddy.
Il doit être suivi avec un tag d’image immuable par release. Ne jamais utiliser
`latest` en production.

## 1. Pré-requis de lancement

- confirmer le VPS Hostinger cible ;
- publier le code dans un dépôt privé ou l’image dans un registre accessible ;
- confirmer la propriété de `ozastra.com` et l’accès à sa zone Cloudflare ;
- vérifier le domaine expéditeur chez Resend ;
- installer `CONTACT_PROVIDER_API_KEY` dans le secret store du projet ;
- choisir le canal d’alerte de disponibilité ;
- compléter les mentions légales avec les informations réelles de la LLC ;
- valider la version candidate sur un iPhone et un autre mobile réel.

État constaté le 7 août 2026 :

- VPS `1533941` : Ubuntu 24.04, actif, Docker Manager non disponible ;
- VPS `1876411` : Ubuntu 24.04, actif, production `zevent-production` déjà
  exposée sur 80/443 ;
- `ozastra.com` : nameservers Cloudflare présents, aucun A/AAAA public ;
- workspace local : aucun dépôt Git initialisé.

Ne pas réinstaller le premier VPS ou modifier la production du second sans une
décision explicite et une sauvegarde vérifiée.

## 2. Variables attendues

Créer les valeurs depuis `.env.production.example`. Les variables `VITE_*`
sont injectées au build ; les secrets de contact sont injectés uniquement à
l’exécution.

Variables publiques :

- `VITE_SITE_URL=https://ozastra.com`
- `OZASTRA_DOMAIN=ozastra.com`

Secrets/runtime :

- `CONTACT_PROVIDER_API_KEY`
- `CONTACT_RECIPIENT`
- `CONTACT_SENDER`
- `CONTACT_RATE_LIMIT_MAX`
- `CONTACT_RATE_LIMIT_WINDOW_SECONDS`

## 3. Préflight d’une release

Depuis une copie propre et identifiée du code :

```bash
pnpm install --frozen-lockfile
pnpm roadmap:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check:bundle
pnpm audit --prod
```

Construire ensuite une image avec un identifiant immuable, par exemple le SHA
Git complet :

```bash
docker build \
  --build-arg VITE_SITE_URL=https://ozastra.com \
  --tag registry.example.com/ozastra:<release-id> .
docker push registry.example.com/ozastra:<release-id>
```

Conserver dans le journal de release : identifiant, digest de l’image, date,
opérateur, résultat des tests et identifiant de la release précédente.

## 4. Mise en production

1. Lire l’état Hostinger : VM, firewall, backups, snapshot, projets et métriques.
2. Sauvegarder la configuration du projet actuellement déployé.
3. Créer un snapshot si la cible ne contient pas déjà un snapshot à préserver.
   Hostinger ne conserve qu’un snapshot manuel : cette opération nécessite une
   confirmation explicite.
4. Déployer le nouveau tag d’image avec les variables runtime, sans exposer le
   port 3000 publiquement.
5. Attendre l’état `healthy` de `/api/health`.
6. Pointer les enregistrements Cloudflare A et AAAA vers le VPS retenu.
7. Vérifier l’émission du certificat Caddy et la redirection HTTP vers HTTPS.
8. Lancer :

```bash
OZASTRA_SMOKE_BASE_URL=https://ozastra.com pnpm smoke:production
```

9. Tester manuellement le formulaire avec une adresse contrôlée et confirmer la
   réception du message.
10. Contrôler les logs, les métriques VPS et l’alerte externe pendant 30 minutes.

Le firewall public doit limiter les entrées à SSH, HTTP, HTTPS et HTTP/3 si ce
dernier est conservé. Le port applicatif 3000 reste interne au réseau Docker.

## 5. Critères d’arrêt immédiat

Déclencher un rollback si l’une des conditions suivantes apparaît :

- `/api/health` ne répond pas en 200 ou le conteneur devient unhealthy ;
- une route publique critique renvoie 5xx ;
- le smoke test échoue ;
- les assets ou métadonnées pointent vers une mauvaise origine ;
- le formulaire échoue avec des secrets pourtant valides ;
- le taux d’erreurs ou l’utilisation CPU/mémoire augmente brutalement ;
- le certificat HTTPS ou les en-têtes de sécurité sont absents.

## 6. Rollback applicatif

1. Ne pas supprimer le conteneur, les logs ou l’image en échec avant diagnostic.
2. Remettre le tag immuable de la dernière release stable dans la configuration
   du projet.
3. Recréer uniquement les services Ozastra ; ne pas redémarrer le VPS complet et
   ne pas toucher à `zevent-production`.
4. Attendre le healthcheck.
5. Relancer `pnpm smoke:production` contre le domaine public.
6. Confirmer la réception d’un message de test.
7. Noter l’incident, l’image fautive, l’heure du rollback et son résultat.

Si la nouvelle release impliquait un changement DNS, rétablir l’ancienne cible
et surveiller la propagation pendant au moins deux TTL. Si le rollback
applicatif est impossible et que la VM entière est compromise, la restauration
du snapshot ou d’un backup Hostinger est le dernier recours : elle écrase
l’état courant et requiert une confirmation destructive distincte.

## 7. Validation post-rollback

Le rollback est terminé uniquement lorsque :

- toutes les routes et ressources du smoke test sont vertes ;
- `/api/health` reste stable pendant dix minutes ;
- HTTPS et les en-têtes de sécurité sont présents ;
- le formulaire fonctionne ;
- le monitoring ne signale plus d’erreur ;
- l’identifiant de la release restaurée est consigné.
