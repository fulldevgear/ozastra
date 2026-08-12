# Ozastra — contrat international

## Décision

L’anglais est la langue source et la langue publique par défaut dès la mise à
disposition de la version bilingue. Le français devient une variante complète
sous le préfixe `/fr`. Toute langue ajoutée ensuite suit le même contrat sans
dupliquer l’arbre de routes ni les composants.

La locale de l’URL est l’unique autorité pour le rendu initial, l’hydratation,
les contenus, les liens et les métadonnées. Une préférence navigateur peut
motiver une suggestion non bloquante, mais ne remplace jamais silencieusement
la langue de l’URL.

## Contrat des URLs

| Ressource        | Anglais canonique | Français         | Future langue `es` |
| ---------------- | ----------------- | ---------------- | ------------------ |
| Accueil          | `/`               | `/fr`            | `/es`              |
| Projets          | `/work`           | `/fr/work`       | `/es/work`         |
| Étude de cas     | `/work/:slug`     | `/fr/work/:slug` | `/es/work/:slug`   |
| Services         | `/services`       | `/fr/services`   | `/es/services`     |
| À propos         | `/about`          | `/fr/about`      | `/es/about`        |
| Contact          | `/contact`        | `/fr/contact`    | `/es/contact`      |
| Mentions légales | `/legal`          | `/fr/legal`      | `/es/legal`        |
| Confidentialité  | `/privacy`        | `/fr/privacy`    | `/es/privacy`      |

Les chemins fonctionnels restent identiques entre les langues. Seul le préfixe
change. Les slugs de projets sont des identifiants stables et ne sont pas
traduits dans la première version.

Les alias `/en` et `/en/*`, s’ils sont rencontrés, redirigent de façon
permanente vers l’équivalent anglais sans préfixe. Une locale inconnue ou en
brouillon ne produit pas de page publique.

## Cycle de vie d’une locale

Chaque locale déclarée possède un statut :

- `draft` : disponible pour l’extraction, la traduction et les tests locaux,
  mais absente du sélecteur public, du pré-rendu et du sitemap ;
- `published` : complète, pré-rendue, indexable et proposée dans le sélecteur.

Le passage à `published` exige :

1. un catalogue sans message manquant ;
2. toutes les pages éditoriales requises ;
3. chaque étude de cas publiée dans cette locale ;
4. les métadonnées, données structurées et libellés accessibles ;
5. les contrôles responsive, accessibilité et performance.

Aucun fallback public ne doit fabriquer une page hybride. Une locale publiée
incomplète fait échouer la validation ou le build.

## Migration de la version française actuelle

Le basculement est atomique :

1. construire et tester le socle multilingue sans publier une version partielle ;
2. finaliser l’intégralité du texte source anglais ;
3. conserver les textes français actuels dans le catalogue et les MDX français ;
4. pré-rendre simultanément les URLs anglaises sans préfixe et françaises sous
   `/fr` ;
5. publier dans le même artefact les canonicals, `hreflang`, `x-default` et le
   sitemap bilingues ;
6. vérifier les parcours critiques dans les deux langues avant déploiement.

La production n’étant pas encore publique, aucune redirection d’anciennes URLs
françaises n’est nécessaire : les URLs sans préfixe deviennent anglaises au
premier lancement bilingue. Si une version française est rendue publique avant
ce basculement, une revue SEO spécifique devient obligatoire.

## Langue source et ton éditorial

L’anglais international est la source des messages Lingui et des futures
traductions. Les identifiants sont explicites et stables afin qu’une réécriture
du texte anglais ne déconnecte pas les autres langues.

Les signatures de marque et noms d’expertises peuvent rester en anglais dans
toutes les locales lorsqu’ils sont intentionnels : `Product engineering`,
`Applied AI`, `SaaS products`, `Web experiences` et `Mobile apps`. Leur
explication demeure entièrement localisée.

Les traductions doivent préserver un ton clair, direct, premium et peu
jargonisant. Les pages légales requièrent une validation humaine avant leur
publication.

## Garanties de performance

- Un seul catalogue Lingui est chargé pour une page.
- Un seul module MDX de détail est chargé pour une étude de cas.
- Les langues non actives restent dans des chunks séparés.
- Les routes, le sitemap et les alternates sont générés depuis le registre des
  locales publiées.
- Le nombre de langues peut augmenter le temps de build et le volume statique
  produit, jamais la charge utile d’un visiteur dans une autre langue.

## Ajouter et publier une langue

La commande suivante crée une locale en brouillon, son catalogue PO, un
manifeste de projets vide et son guide de contenu :

```sh
pnpm locale:add -- es "Español" es_ES ltr
```

Le cycle de traduction est ensuite :

1. lancer `pnpm i18n:extract` pour synchroniser tous les catalogues, brouillons
   compris ;
2. traduire `src/locales/<locale>/messages.po` sans modifier les identifiants ;
3. ajouter la section correspondante dans `src/i18n/seo-copy.json` ;
4. traduire chaque entrée de `src/content/projects/<locale>/manifest.json` et
   chaque corps `<slug>.mdx` ;
5. relire navigation, conversion, ton éditorial, SEO, textes légaux et chaînes
   interpolées sur petits et grands écrans ;
6. passer le statut de la locale à `published` dans `locales.json` ;
7. lancer `pnpm i18n:validate`, `pnpm typecheck`, `pnpm test` et `pnpm build`.

Le build commence par régénérer `public-pages.json`, les imports de catalogues,
le sitemap et `robots.txt`. La génération bloque une locale publiée si son SEO,
son catalogue, son manifeste ou un MDX manque. Une locale `draft` reste absente
des imports client, des routes, du sélecteur et du sitemap ; elle peut donc être
traduite progressivement sans affecter le site public ni ses bundles.

## Revue éditoriale

La revue se fait par locale et non chaîne par chaîne isolée. Elle vérifie le
parcours complet : promesse de marque, cohérence terminologique, appels à
l’action, formulaire et retours d’erreur, projets, SEO, accessibilité et pages
légales. Son résultat est consigné dans `docs/translation-review.md` avant la
promotion en `published`.
