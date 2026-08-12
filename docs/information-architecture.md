# Ozastra — architecture de l’information

## Wireframe de la page d’accueil

1. **Navigation** — identifier Ozastra, accéder aux projets, expertises,
   approche et contact.
2. **Hero** — comprendre la proposition de valeur en moins de dix secondes et
   découvrir l’artefact orbital dans son état abstrait.
3. **Capability strip** — clarifier immédiatement Web, AI, SaaS, Mobile et
   Product Engineering.
4. **Selected work** — présenter Orbit et Axiom comme concepts et conduire vers
   leurs études de cas dédiées.
5. **Expertises** — séparer les quatre anneaux et relier chaque discipline à une
   capacité concrète.
6. **Approche** — expliquer Clarifier, Concevoir, Construire, Lancer, Améliorer.
7. **Manifeste** — exprimer le point de vue d’Ozastra sur la technologie.
8. **Contact** — recomposer l’artefact et convertir l’intérêt en demande.
9. **Footer** — rappeler l’identité, les expertises et les liens légaux.

## Routes publiques bilingues

| Anglais canonique | Français         | Rôle                                 | Rendu                          |
| ----------------- | ---------------- | ------------------------------------ | ------------------------------ |
| `/`               | `/fr`            | Page d’accueil et narration orbitale | Pré-rendu                      |
| `/work`           | `/fr/work`       | Index des études de cas              | Pré-rendu                      |
| `/work/orbit`     | `/fr/work/orbit` | Étude de cas conceptuelle Orbit      | Pré-rendu                      |
| `/work/axiom`     | `/fr/work/axiom` | Étude de cas conceptuelle Axiom      | Pré-rendu                      |
| `/about`          | `/fr/about`      | Positionnement et approche           | Pré-rendu                      |
| `/services`       | `/fr/services`   | Services détaillés                   | Pré-rendu                      |
| `/contact`        | `/fr/contact`    | Formulaire détaillé                  | Pré-rendu + soumission serveur |
| `/legal`          | `/fr/legal`      | Mentions légales                     | Pré-rendu                      |
| `/privacy`        | `/fr/privacy`    | Confidentialité                      | Pré-rendu                      |
| `404`             | `404`            | Page introuvable localisée           | Fallback statique              |

L’absence de préfixe désigne toujours l’anglais. Toutes les autres langues
publiées utilisent leur code comme premier segment. Le détail du contrat figure
dans [`docs/internationalization.md`](internationalization.md).

## Parcours de contact

1. Le visiteur découvre le positionnement.
2. Il consulte une expertise ou une étude de cas.
3. Il active « Démarrer un projet » ou « Parlons-en ».
4. La page Contact demande uniquement les informations utiles : nom, email,
   type de projet, budget facultatif, message et consentement.
5. Le navigateur affiche une validation immédiate non autoritaire.
6. Le serveur valide à nouveau, contrôle le honeypot et la limite de débit.
7. Le visiteur reçoit un état clair : succès, erreur récupérable ou fallback
   email.

## Métadonnées

Chaque route définit un titre, une description, une URL canonique et des
métadonnées sociales propres. Les études de cas indiquent explicitement leur
statut conceptuel. Les contenus essentiels et métadonnées sont présents dans le
HTML pré-rendu, jamais uniquement générés côté client.
