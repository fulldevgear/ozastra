import type { Locale } from './locales'

type PageSeo = { title: string; description: string }
type SeoCopy = Record<
  Locale,
  {
    home: PageSeo
    about: PageSeo
    services: PageSeo
    work: PageSeo
    contact: PageSeo
    legal: PageSeo
    privacy: PageSeo
    imageAlt: string
    projectsBreadcrumb: string
    organizationDescription: string
  }
>

export const seoCopy = {
  en: {
    home: {
      title: 'Ozastra — Product engineering studio',
      description:
        'Ozastra designs and builds remarkable web experiences, SaaS products, mobile applications and applied AI solutions.',
    },
    about: {
      title: 'About — Ozastra',
      description:
        'Ozastra is an independent product engineering studio bringing strategy, design and development together.',
    },
    services: {
      title: 'Services — Ozastra',
      description:
        'Product engineering, web, SaaS, applied AI, mobile and product support: explore how Ozastra can contribute.',
    },
    work: {
      title: 'Work — Ozastra',
      description:
        'Explore Ozastra studies and concepts across product engineering, SaaS, applied AI and web experiences.',
    },
    contact: {
      title: 'Contact — Ozastra',
      description:
        'Tell Ozastra about your web, AI, SaaS or mobile project and receive a structured first response.',
    },
    legal: {
      title: 'Legal notice — Ozastra',
      description:
        'Legal information, intellectual property and liability relating to the Ozastra website.',
    },
    privacy: {
      title: 'Privacy — Ozastra',
      description:
        'Learn what data Ozastra collects, why it is processed and how to exercise your rights.',
    },
    imageAlt: 'Abstract Ozastra orbital artifact',
    projectsBreadcrumb: 'Work',
    organizationDescription:
      'Independent product engineering studio specializing in web, applied AI, SaaS and mobile applications.',
  },
  fr: {
    home: {
      title: 'Ozastra — Studio de product engineering',
      description:
        'Ozastra conçoit et développe des expériences web, produits SaaS, applications mobiles et solutions IA remarquables.',
    },
    about: {
      title: 'À propos — Ozastra',
      description:
        'Ozastra est un studio indépendant de product engineering qui réunit stratégie, design et développement.',
    },
    services: {
      title: 'Services — Ozastra',
      description:
        'Product engineering, web, SaaS, IA appliquée, mobile et renfort produit : découvrez comment Ozastra peut intervenir.',
    },
    work: {
      title: 'Projets — Ozastra',
      description:
        'Découvrez les études et concepts Ozastra en product engineering, SaaS, IA appliquée et expérience web.',
    },
    contact: {
      title: 'Contact — Ozastra',
      description:
        'Présentez votre projet web, IA, SaaS ou mobile à Ozastra et recevez une première réponse structurée.',
    },
    legal: {
      title: 'Mentions légales — Ozastra',
      description:
        'Informations légales, propriété intellectuelle et responsabilité relatives au site Ozastra.',
    },
    privacy: {
      title: 'Confidentialité — Ozastra',
      description:
        'Découvrez quelles données Ozastra collecte, pourquoi elles sont traitées et comment exercer vos droits.',
    },
    imageAlt: 'Artefact orbital abstrait Ozastra',
    projectsBreadcrumb: 'Projets',
    organizationDescription:
      'Studio indépendant de product engineering spécialisé en web, IA appliquée, SaaS et applications mobiles.',
  },
} satisfies SeoCopy
