#!/usr/bin/env node

import { readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const roadmapPath = join(scriptDirectory, '..', 'paradigm-roadmap.json')

function fail(message) {
  console.error(`Roadmap error: ${message}`)
  process.exitCode = 1
}

function usage() {
  console.log(`Usage:
  node scripts/update-roadmap.mjs start-step <phase> <deliverable> [note]
  node scripts/update-roadmap.mjs complete-step <phase> <deliverable> <evidence>
  node scripts/update-roadmap.mjs block-step <phase> <deliverable> <reason>
  node scripts/update-roadmap.mjs verify-phase <phase> <evidence>
  node scripts/update-roadmap.mjs note <phase> <message>
  node scripts/update-roadmap.mjs validate
  node scripts/update-roadmap.mjs status`)
}

async function readRoadmap() {
  const source = await readFile(roadmapPath, 'utf8')
  return JSON.parse(source)
}

function requireInteger(value, label) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isInteger(parsed) || String(parsed) !== String(value)) {
    throw new Error(`${label} must be an integer, received "${value}".`)
  }
  return parsed
}

function findPhase(roadmap, phaseValue) {
  const phaseNumber = requireInteger(phaseValue, 'Phase')
  const phase = roadmap.implementation_roadmap.find(
    (candidate) => candidate.phase === phaseNumber,
  )

  if (!phase) {
    throw new Error(`Phase ${phaseNumber} does not exist.`)
  }

  return phase
}

function findDeliverable(phase, deliverableValue) {
  const deliverableIndex = requireInteger(deliverableValue, 'Deliverable')

  if (deliverableIndex < 1 || deliverableIndex > phase.deliverables.length) {
    throw new Error(
      `Deliverable ${deliverableIndex} does not exist in phase ${phase.phase}. Expected 1-${phase.deliverables.length}.`,
    )
  }

  return {
    index: deliverableIndex,
    description: phase.deliverables[deliverableIndex - 1],
  }
}

function requireMessage(parts, label) {
  const message = parts.join(' ').trim()
  if (!message) {
    throw new Error(`${label} is required.`)
  }
  return message
}

function timestamp() {
  return new Date().toISOString()
}

function addActivity(roadmap, activity) {
  roadmap.project_tracking.activity_log.push({
    timestamp: timestamp(),
    ...activity,
  })
}

function calculateProgress(roadmap) {
  let totalDeliverables = 0
  let completedDeliverables = 0

  for (const phase of roadmap.implementation_roadmap) {
    const completed = phase.tracking.completed_deliverables.length
    const total = phase.deliverables.length

    phase.tracking.progress_percent = total
      ? Math.round((completed / total) * 100)
      : 100
    totalDeliverables += total
    completedDeliverables += completed
  }

  roadmap.project_tracking.overall_progress_percent = totalDeliverables
    ? Math.round((completedDeliverables / totalDeliverables) * 100)
    : 100
}

function validationErrors(roadmap) {
  const errors = []
  const phases = roadmap.implementation_roadmap
  const phaseNumbers = phases.map((phase) => phase.phase)
  const phaseNumberSet = new Set(phaseNumbers)
  const allowedStatuses = new Set(
    roadmap.project_tracking.allowed_phase_statuses,
  )

  if (phaseNumbers.length !== phaseNumberSet.size) {
    errors.push('Phase numbers must be unique.')
  }

  let totalDeliverables = 0
  let completedDeliverables = 0

  for (const phase of phases) {
    if (!allowedStatuses.has(phase.status)) {
      errors.push(
        `Phase ${phase.phase} has unsupported status "${phase.status}".`,
      )
    }

    if (!phase.tracking) {
      errors.push(`Phase ${phase.phase} is missing tracking metadata.`)
      continue
    }

    for (const dependency of phase.dependencies) {
      if (!phaseNumberSet.has(dependency)) {
        errors.push(
          `Phase ${phase.phase} references missing dependency ${dependency}.`,
        )
      }
      if (dependency === phase.phase) {
        errors.push(`Phase ${phase.phase} cannot depend on itself.`)
      }
    }

    const total = phase.deliverables.length
    const completedIndexes = phase.tracking.completed_deliverables.map(
      (entry) => entry.index,
    )
    const blockedIndexes = phase.tracking.blocked_deliverables.map(
      (entry) => entry.index,
    )
    const completedIndexSet = new Set(completedIndexes)
    const blockedIndexSet = new Set(blockedIndexes)

    if (completedIndexes.length !== completedIndexSet.size) {
      errors.push(`Phase ${phase.phase} contains duplicate completed steps.`)
    }
    if (blockedIndexes.length !== blockedIndexSet.size) {
      errors.push(`Phase ${phase.phase} contains duplicate blocked steps.`)
    }

    for (const index of [...completedIndexes, ...blockedIndexes]) {
      if (!Number.isInteger(index) || index < 1 || index > total) {
        errors.push(
          `Phase ${phase.phase} references invalid deliverable ${index}.`,
        )
      }
    }

    for (const index of completedIndexSet) {
      if (blockedIndexSet.has(index)) {
        errors.push(
          `Phase ${phase.phase}, deliverable ${index} is both completed and blocked.`,
        )
      }
    }

    if (
      phase.tracking.active_deliverable !== null &&
      (!Number.isInteger(phase.tracking.active_deliverable) ||
        phase.tracking.active_deliverable < 1 ||
        phase.tracking.active_deliverable > total)
    ) {
      errors.push(`Phase ${phase.phase} has an invalid active deliverable.`)
    }

    if (completedIndexSet.has(phase.tracking.active_deliverable)) {
      errors.push(
        `Phase ${phase.phase} has a completed deliverable marked as active.`,
      )
    }

    const expectedProgress = total
      ? Math.round((completedIndexes.length / total) * 100)
      : 100

    if (phase.tracking.progress_percent !== expectedProgress) {
      errors.push(
        `Phase ${phase.phase} progress is ${phase.tracking.progress_percent}, expected ${expectedProgress}.`,
      )
    }

    if (
      ['ready_for_review', 'completed'].includes(phase.status) &&
      completedIndexes.length !== total
    ) {
      errors.push(
        `Phase ${phase.phase} cannot be ${phase.status} before all deliverables are completed.`,
      )
    }

    if (phase.status === 'completed' && !phase.tracking.verification) {
      errors.push(
        `Completed phase ${phase.phase} requires verification evidence.`,
      )
    }

    totalDeliverables += total
    completedDeliverables += completedIndexes.length
  }

  const expectedOverallProgress = totalDeliverables
    ? Math.round((completedDeliverables / totalDeliverables) * 100)
    : 100

  if (
    roadmap.project_tracking.overall_progress_percent !==
    expectedOverallProgress
  ) {
    errors.push(
      `Overall progress is ${roadmap.project_tracking.overall_progress_percent}, expected ${expectedOverallProgress}.`,
    )
  }

  const currentPhase = roadmap.project_tracking.current_phase
  const currentDeliverable = roadmap.project_tracking.current_deliverable

  if (currentPhase === null && currentDeliverable !== null) {
    errors.push('A current deliverable requires a current phase.')
  }

  if (currentPhase !== null) {
    const phase = phases.find((candidate) => candidate.phase === currentPhase)
    if (!phase) {
      errors.push(`Current phase ${currentPhase} does not exist.`)
    } else if (
      currentDeliverable !== null &&
      phase.tracking.active_deliverable !== currentDeliverable
    ) {
      errors.push(
        'Project-level current deliverable does not match phase tracking.',
      )
    }
  }

  return errors
}

function assertValid(roadmap) {
  const errors = validationErrors(roadmap)
  if (errors.length) {
    throw new Error(`Roadmap validation failed:\n- ${errors.join('\n- ')}`)
  }
}

async function writeRoadmap(roadmap) {
  calculateProgress(roadmap)
  roadmap.document.revision = (roadmap.document.revision ?? 0) + 1
  roadmap.document.last_updated = timestamp().slice(0, 10)
  roadmap.project_tracking.last_activity_at = timestamp()
  assertValid(roadmap)

  const temporaryPath = `${roadmapPath}.${process.pid}.tmp`
  const serialized = `${JSON.stringify(roadmap, null, 2)}\n`

  try {
    JSON.parse(serialized)
    await writeFile(temporaryPath, serialized, 'utf8')
    await rename(temporaryPath, roadmapPath)
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined)
    throw error
  }
}

function requireNoActiveStep(roadmap) {
  if (roadmap.project_tracking.current_deliverable !== null) {
    throw new Error(
      `Phase ${roadmap.project_tracking.current_phase}, deliverable ${roadmap.project_tracking.current_deliverable} is already active. Complete or block it first.`,
    )
  }
}

function requireActiveStep(roadmap, phase, deliverable) {
  if (
    roadmap.project_tracking.current_phase !== phase.phase ||
    roadmap.project_tracking.current_deliverable !== deliverable.index ||
    phase.tracking.active_deliverable !== deliverable.index
  ) {
    throw new Error(
      `Phase ${phase.phase}, deliverable ${deliverable.index} is not the active step. Run start-step first.`,
    )
  }
}

function printStatus(roadmap) {
  console.log(
    `Ozastra roadmap — ${roadmap.project_tracking.overall_progress_percent}% complete`,
  )

  for (const phase of roadmap.implementation_roadmap) {
    const completed = phase.tracking.completed_deliverables.length
    console.log(
      `${phase.phase}. ${phase.name}: ${phase.status} (${completed}/${phase.deliverables.length}, ${phase.tracking.progress_percent}%)`,
    )
  }

  if (roadmap.project_tracking.current_deliverable !== null) {
    console.log(
      `Active: phase ${roadmap.project_tracking.current_phase}, deliverable ${roadmap.project_tracking.current_deliverable}`,
    )
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2)
  if (!command || ['help', '--help', '-h'].includes(command)) {
    usage()
    return
  }

  const roadmap = await readRoadmap()

  if (command === 'validate') {
    assertValid(roadmap)
    console.log('Roadmap is valid.')
    printStatus(roadmap)
    return
  }

  if (command === 'status') {
    assertValid(roadmap)
    printStatus(roadmap)
    return
  }

  if (command === 'start-step') {
    const [phaseValue, deliverableValue, ...noteParts] = args
    const phase = findPhase(roadmap, phaseValue)
    const deliverable = findDeliverable(phase, deliverableValue)
    const note = noteParts.join(' ').trim() || null

    requireNoActiveStep(roadmap)
    if (
      phase.tracking.completed_deliverables.some(
        (entry) => entry.index === deliverable.index,
      )
    ) {
      throw new Error('A completed deliverable cannot be started again.')
    }

    phase.status = 'in_progress'
    phase.tracking.active_deliverable = deliverable.index
    phase.tracking.blocked_deliverables =
      phase.tracking.blocked_deliverables.filter(
        (entry) => entry.index !== deliverable.index,
      )
    phase.tracking.last_updated_at = timestamp()
    roadmap.project_tracking.current_phase = phase.phase
    roadmap.project_tracking.current_deliverable = deliverable.index
    addActivity(roadmap, {
      event: 'start_step',
      phase: phase.phase,
      deliverable: deliverable.index,
      description: deliverable.description,
      note,
    })
    await writeRoadmap(roadmap)
    console.log(
      `Started phase ${phase.phase}, deliverable ${deliverable.index}: ${deliverable.description}`,
    )
    return
  }

  if (command === 'complete-step') {
    const [phaseValue, deliverableValue, ...evidenceParts] = args
    const phase = findPhase(roadmap, phaseValue)
    const deliverable = findDeliverable(phase, deliverableValue)
    const evidence = requireMessage(evidenceParts, 'Completion evidence')

    requireActiveStep(roadmap, phase, deliverable)
    phase.tracking.completed_deliverables.push({
      index: deliverable.index,
      description: deliverable.description,
      completed_at: timestamp(),
      evidence,
    })
    phase.tracking.blocked_deliverables =
      phase.tracking.blocked_deliverables.filter(
        (entry) => entry.index !== deliverable.index,
      )
    phase.tracking.active_deliverable = null
    phase.tracking.last_updated_at = timestamp()
    phase.status =
      phase.tracking.completed_deliverables.length === phase.deliverables.length
        ? 'ready_for_review'
        : 'in_progress'
    roadmap.project_tracking.current_phase = phase.phase
    roadmap.project_tracking.current_deliverable = null
    addActivity(roadmap, {
      event: 'complete_step',
      phase: phase.phase,
      deliverable: deliverable.index,
      description: deliverable.description,
      evidence,
    })
    await writeRoadmap(roadmap)
    console.log(
      `Completed phase ${phase.phase}, deliverable ${deliverable.index}: ${deliverable.description}`,
    )
    return
  }

  if (command === 'block-step') {
    const [phaseValue, deliverableValue, ...reasonParts] = args
    const phase = findPhase(roadmap, phaseValue)
    const deliverable = findDeliverable(phase, deliverableValue)
    const reason = requireMessage(reasonParts, 'Blocking reason')

    requireActiveStep(roadmap, phase, deliverable)
    phase.tracking.blocked_deliverables =
      phase.tracking.blocked_deliverables.filter(
        (entry) => entry.index !== deliverable.index,
      )
    phase.tracking.blocked_deliverables.push({
      index: deliverable.index,
      description: deliverable.description,
      blocked_at: timestamp(),
      reason,
    })
    phase.tracking.active_deliverable = null
    phase.tracking.last_updated_at = timestamp()
    phase.status = 'blocked'
    roadmap.project_tracking.current_phase = phase.phase
    roadmap.project_tracking.current_deliverable = null
    addActivity(roadmap, {
      event: 'block_step',
      phase: phase.phase,
      deliverable: deliverable.index,
      description: deliverable.description,
      reason,
    })
    await writeRoadmap(roadmap)
    console.log(
      `Blocked phase ${phase.phase}, deliverable ${deliverable.index}: ${reason}`,
    )
    return
  }

  if (command === 'verify-phase') {
    const [phaseValue, ...evidenceParts] = args
    const phase = findPhase(roadmap, phaseValue)
    const evidence = requireMessage(evidenceParts, 'Verification evidence')

    if (
      phase.tracking.completed_deliverables.length !== phase.deliverables.length
    ) {
      throw new Error(
        `Phase ${phase.phase} still has incomplete deliverables and cannot be verified.`,
      )
    }
    if (phase.tracking.active_deliverable !== null) {
      throw new Error(`Phase ${phase.phase} still has an active deliverable.`)
    }

    phase.status = 'completed'
    phase.tracking.verification = {
      verified_at: timestamp(),
      evidence,
    }
    phase.tracking.last_updated_at = timestamp()
    if (roadmap.project_tracking.current_phase === phase.phase) {
      roadmap.project_tracking.current_phase = null
      roadmap.project_tracking.current_deliverable = null
    }
    addActivity(roadmap, {
      event: 'verify_phase',
      phase: phase.phase,
      evidence,
    })
    await writeRoadmap(roadmap)
    console.log(`Verified and completed phase ${phase.phase}: ${phase.name}`)
    return
  }

  if (command === 'note') {
    const [phaseValue, ...messageParts] = args
    const phase = findPhase(roadmap, phaseValue)
    const message = requireMessage(messageParts, 'Note')

    addActivity(roadmap, {
      event: 'note',
      phase: phase.phase,
      message,
    })
    await writeRoadmap(roadmap)
    console.log(`Added note to phase ${phase.phase}.`)
    return
  }

  throw new Error(`Unknown command "${command}".`)
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error))
})
