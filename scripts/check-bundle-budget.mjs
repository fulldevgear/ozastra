import { gzipSync } from 'node:zlib'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const assetsDirectory = path.resolve('.output/public/assets')
const files = (await readdir(assetsDirectory)).filter((file) =>
  file.endsWith('.js'),
)
const measurements = await Promise.all(
  files.map(async (file) => ({
    file,
    gzipBytes: gzipSync(await readFile(path.join(assetsDirectory, file)))
      .byteLength,
  })),
)

const orbital = measurements.find(({ file }) =>
  file.startsWith('OrbitalExperience-'),
)
if (!orbital) throw new Error('OrbitalExperience chunk not found')

const uiTotal = measurements
  .filter(({ file }) => file !== orbital.file)
  .reduce((total, measurement) => total + measurement.gzipBytes, 0)

const budgets = [
  { label: 'UI JavaScript total', actual: uiTotal, maximum: 200 * 1024 },
  { label: 'Orbital 3D chunk', actual: orbital.gzipBytes, maximum: 450 * 1024 },
]

for (const budget of budgets) {
  const actualKb = (budget.actual / 1024).toFixed(1)
  const maximumKb = (budget.maximum / 1024).toFixed(0)
  console.log(`${budget.label}: ${actualKb} kB gzip / ${maximumKb} kB`)
  if (budget.actual > budget.maximum) {
    throw new Error(`${budget.label} exceeds its gzip budget`)
  }
}
