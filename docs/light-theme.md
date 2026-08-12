# Ozastra — thème clair

Le thème clair n’est pas une inversion du thème sombre. Il transpose la même
direction « quiet deep-tech » dans une lumière de studio plus minérale.

## Atmosphère

- fond ivoire minéral `#F3F0E8`, jamais blanc clinique ;
- surfaces architecturales `#E9E6DE` et `#FCFAF5` ;
- texte graphite `#11141C` et secondaire ardoise `#5F6675` ;
- bleu orbital densifié `#3457D5` pour conserver le contraste ;
- violet minéral `#7556D8` uniquement en accent ;
- noyau orbital toujours sombre afin de préserver la matière et la gravité.

La profondeur vient des différences tonales, des séparateurs graphite fins et
de la lumière diffuse. Les ombres lourdes, le blanc pur et les effets néon
restent hors direction.

## Règles d’usage

- Les noms de tokens existants restent sémantiques : `ink` représente le fond
  et `ivory` le texte principal dans les deux modes.
- Le thème initial suit le système si aucun choix n’a été enregistré.
- Un choix explicite est persisté localement et prioritaire sur le système.
- Le contrôle doit être accessible au clavier et annoncer clairement le thème
  activé.
- Le rendu initial, le fallback CSS et la scène WebGL doivent conserver la même
  atmosphère, sans flash de thème.
