// Ordered map: more specific phrases checked before generic ones.
const KEYWORD_TO_CLASS = [
  ['full stack', 'Full Stack Sorcerer'],
  ['fullstack', 'Full Stack Sorcerer'],
  ['next', 'SSR Sorcerer'],
  ['react', 'Frontend Alchemist'],
  ['vue', 'Component Conjurer'],
  ['angular', 'Directive Druid'],
  ['spring', 'Backend Whisperer'],
  ['java', 'Bytecode Bender'],
  ['python', 'Script Sage'],
  ['django', 'Model Mystic'],
  ['node', 'Event Loop Ranger'],
  ['flutter', 'Widget Wizard'],
  ['kotlin', 'Kotlin Knight'],
  ['android', 'Kotlin Knight'],
  ['swift', 'Swift Shaman'],
  ['ios', 'Swift Shaman'],
  ['machine learning', 'Gradient Guru'],
  ['ml', 'Gradient Guru'],
  ['ai', 'Neural Nomad'],
  ['data', 'Pipeline Paladin'],
  ['devops', 'Deploy Druid'],
  ['docker', 'Container Captain'],
  ['kubernetes', 'Cluster Commander'],
  ['blockchain', 'Chain Conjurer'],
  ['solidity', 'Contract Crafter'],
  ['design', 'Pixel Paladin'],
  ['ui', 'Pixel Paladin'],
]

const FALLBACK_CLASSES = [
  'Code Nomad',
  'Bug Slayer',
  'Stack Overflow Sage',
  'Terminal Tamer',
  'Merge Conflict Survivor',
  'Midnight Builder',
]

export function generateBuilderClass(stack) {
  if (!stack || !stack.trim()) {
    return randomFallback()
  }
  const normalized = stack.toLowerCase()
  for (const [keyword, label] of KEYWORD_TO_CLASS) {
    if (normalized.includes(keyword)) {
      return label
    }
  }
  return randomFallback()
}

function randomFallback() {
  return FALLBACK_CLASSES[Math.floor(Math.random() * FALLBACK_CLASSES.length)]
}
