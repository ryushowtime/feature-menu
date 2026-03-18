import { Skill } from './types'

export interface UsageData {
  favorites: string[]
  recent: string[]
  stats: Record<string, number>
  lastVisit: string | null
}

const STORAGE_KEY = 'feature-menu-usage'

function getDefaultData(): UsageData {
  return {
    favorites: [],
    recent: [],
    stats: {},
    lastVisit: null,
  }
}

export function loadUsageData(): UsageData {
  if (typeof window === 'undefined') {
    return getDefaultData()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // ignore parse errors
  }
  return getDefaultData()
}

export function saveUsageData(data: UsageData): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore storage errors
  }
}

export function toggleFavorite(skillId: string): UsageData {
  const data = loadUsageData()
  const index = data.favorites.indexOf(skillId)

  if (index >= 0) {
    data.favorites.splice(index, 1)
  } else {
    data.favorites.push(skillId)
  }

  saveUsageData(data)
  return data
}

export function recordUsage(skillId: string): UsageData {
  const data = loadUsageData()

  data.stats[skillId] = (data.stats[skillId] || 0) + 1

  const recentIndex = data.recent.indexOf(skillId)
  if (recentIndex >= 0) {
    data.recent.splice(recentIndex, 1)
  }
  data.recent.unshift(skillId)

  if (data.recent.length > 10) {
    data.recent = data.recent.slice(0, 10)
  }

  data.lastVisit = new Date().toISOString()

  saveUsageData(data)
  return data
}

export function getFavoriteSkills(skills: Skill[]): Skill[] {
  const data = loadUsageData()
  return skills.filter(s => data.favorites.includes(s.id))
}

export function getRecentSkills(skills: Skill[]): Skill[] {
  const data = loadUsageData()
  const skillMap = new Map(skills.map(s => [s.id, s]))
  return data.recent
    .map(id => skillMap.get(id))
    .filter((s): s is Skill => s !== undefined)
}

export function getTopUsedSkills(skills: Skill[], limit: number = 6): Skill[] {
  const data = loadUsageData()
  const skillMap = new Map(skills.map(s => [s.id, s]))

  return Object.entries(data.stats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => skillMap.get(id))
    .filter((s): s is Skill => s !== undefined)
}
