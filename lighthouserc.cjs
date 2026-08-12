const { chromium } = require('playwright')

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm preview --host 127.0.0.1 --port 4173',
      startServerReadyPattern: 'Local',
      url: [
        'http://127.0.0.1:4173/',
        'http://127.0.0.1:4173/services',
        'http://127.0.0.1:4173/contact',
        'http://127.0.0.1:4173/fr',
        'http://127.0.0.1:4173/fr/services',
        'http://127.0.0.1:4173/fr/contact',
      ],
      numberOfRuns: 1,
      chromePath: chromium.executablePath(),
      settings: {
        chromeFlags: '--headless --no-sandbox --disable-dev-shm-usage',
        maxWaitForLoad: 90000,
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci/reports' },
  },
}
