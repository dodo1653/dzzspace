export interface CliProfile {
  name: string
  accent: string
  selectionBg: string
  selectionInactiveBg: string
}

export const PROFILES: Record<string, CliProfile> = {
  default: {
    name: 'default',
    accent: '#d4a373',
    selectionBg: 'rgba(212,163,115,0.25)',
    selectionInactiveBg: 'rgba(212,163,115,0.08)'
  },
  claude: {
    name: 'claude',
    accent: '#b88a5c',
    selectionBg: 'rgba(184,138,92,0.25)',
    selectionInactiveBg: 'rgba(184,138,92,0.08)'
  },
  kilo: {
    name: 'kilo',
    accent: '#b483d4',
    selectionBg: 'rgba(180,131,212,0.25)',
    selectionInactiveBg: 'rgba(180,131,212,0.08)'
  },
  gemini: {
    name: 'gemini',
    accent: '#6d8ae8',
    selectionBg: 'rgba(109,138,232,0.25)',
    selectionInactiveBg: 'rgba(109,138,232,0.08)'
  },
  codex: {
    name: 'codex',
    accent: '#4cc2a0',
    selectionBg: 'rgba(76,194,160,0.25)',
    selectionInactiveBg: 'rgba(76,194,160,0.08)'
  },
  devin: {
    name: 'devin',
    accent: '#58b9c6',
    selectionBg: 'rgba(88,185,198,0.25)',
    selectionInactiveBg: 'rgba(88,185,198,0.08)'
  }
}

const CLI_PATTERNS: { regex: RegExp; profile: string }[] = [
  { regex: /\bclaude\b/i, profile: 'claude' },
  { regex: /\bkilo\b/i, profile: 'kilo' },
  { regex: /\bgemini\b/i, profile: 'gemini' },
  { regex: /\bcodex\b/i, profile: 'codex' },
  { regex: /\bdevin\b/i, profile: 'devin' },
]

export function detectCliProfile(data: string, current: string): string {
  for (const { regex, profile } of CLI_PATTERNS) {
    if (regex.test(data) && profile !== current) {
      return profile
    }
  }
  return current
}
