# Revue éditoriale multilingue

## Version bilingue initiale — 12 août 2026

| Périmètre                           | Anglais         | Français               | Résultat                                  |
| ----------------------------------- | --------------- | ---------------------- | ----------------------------------------- |
| Navigation, thème et sélecteur      | relu            | relu                   | cohérent                                  |
| Accueil, à propos et services       | relu            | relu                   | ton clair et premium conservé             |
| Projets Orbit et Axiom              | relu            | relu                   | métadonnées et corps MDX alignés          |
| Contact et états du formulaire      | relu            | relu                   | actions et erreurs compréhensibles        |
| SEO, Open Graph et JSON-LD          | relu            | relu                   | intention et URLs cohérentes              |
| Mentions légales et confidentialité | parité vérifiée | source existante relue | validation juridique de lancement séparée |

La version anglaise est la source éditoriale. La version française a été relue
comme un parcours autonome : elle n’est pas une traduction littérale et
préserve la voix directe d’Ozastra. Les noms de disciplines volontairement
internationaux (`Product engineering`, `SaaS`) restent inchangés lorsque leur
usage est naturel ; leurs explications sont localisées.

La revue confirme la parité linguistique et technique de la version bilingue.
Elle ne remplace pas la validation juridique des coordonnées et mentions
définitives, qui demeure un prérequis de lancement suivi séparément dans la
roadmap.

## Checklist pour une prochaine locale

- Le catalogue ne contient aucun message vide et les variables ICU sont
  conservées.
- Toutes les pages et tous les états interactifs sont relus dans leur contexte.
- Chaque slug publié possède une métadonnée locale et un corps MDX local.
- Les titres, descriptions, textes d’image et breadcrumbs SEO sont naturels.
- Les pages légales sont validées pour la juridiction et la langue visées.
- Les débordements, le mobile, le clavier, le lecteur d’écran et la direction
  `rtl` éventuelle sont vérifiés.
- La locale ne passe à `published` qu’après validation complète du pipeline.
