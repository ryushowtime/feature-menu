import { promises as fs } from 'fs'
import * as fsSync from 'fs'
import path from 'path'
import os from 'os'
import {
  Skill,
  Agent,
  Command,
  SkillCategory,
  SkillLevel,
  SkillStats,
  SearchResult,
  getCategory,
  getLevel,
} from './types'

// 智能路径检测 - 支持多种 Claude Code 安装方式
function detectClaudeCodeRoot(): string | null {
  // 1. 环境变量
  if (process.env.CLAUDE_CODE_ROOT) {
    return process.env.CLAUDE_CODE_ROOT
  }

  const homeDir = os.homedir()

  // 2. 常见路径列表
  const commonPaths = [
    path.join(homeDir, 'everything-claude-code'),
    path.join(homeDir, '.claude'),
    path.join(homeDir, 'Claude Code'),
    path.join(homeDir, 'claude-code'),
  ]

  for (const p of commonPaths) {
    try {
      const skillsPath = path.join(p, 'skills')
      fsSync.accessSync(skillsPath)
      return p
    } catch {
      // 路径不存在，继续检查下一个
    }
  }

  // 3. 当前目录向上搜索（最多向上 4 层）
  let searchDir = process.cwd()
  for (let i = 0; i < 4; i++) {
    const skillsPath = path.join(searchDir, 'skills')
    try {
      fsSync.accessSync(skillsPath)
      return searchDir
    } catch {
      const parent = path.dirname(searchDir)
      if (parent === searchDir) break
      searchDir = parent
    }
  }

  return null
}

// 动态获取根目录
function getClaudeCodeRoot(): string {
  const detected = detectClaudeCodeRoot()
  if (detected) {
    console.log(`[Feature Menu] 检测到 Claude Code 目录: ${detected}`)
    return detected
  }

  const fallback = path.join(process.cwd(), '../..')
  console.warn(`[Feature Menu] 未检测到 Claude Code 目录，使用默认路径: ${fallback}`)
  return fallback
}

const CLAUDE_CODE_ROOT = getClaudeCodeRoot()

// Skills 目录
const SKILLS_ROOT = path.join(CLAUDE_CODE_ROOT, 'skills')

// Agents 目录 - 支持多个可能的位置
function getAgentsRoot(): string {
  const homeDir = os.homedir()
  const possiblePaths = [
    path.join(CLAUDE_CODE_ROOT, 'agents'),
    path.join(homeDir, '.claude', 'agents'),
    path.join(homeDir, '.claude', 'agents-ecc'),
  ]
  for (const p of possiblePaths) {
    try {
      fsSync.accessSync(p)
      return p
    } catch { /* continue */ }
  }
  return possiblePaths[0]
}

// Commands 目录 - 支持多个可能的位置
function getCommandsRoot(): string {
  const homeDir = os.homedir()
  const possiblePaths = [
    path.join(CLAUDE_CODE_ROOT, 'commands'),
    path.join(CLAUDE_CODE_ROOT, 'commands-ecc'),
    path.join(homeDir, '.claude', 'commands'),
    path.join(homeDir, '.claude', 'commands-ecc'),
  ]
  for (const p of possiblePaths) {
    try {
      fsSync.accessSync(p)
      return p
    } catch { /* continue */ }
  }
  return possiblePaths[0]
}

const AGENTS_ROOT = getAgentsRoot()
const COMMANDS_ROOT = getCommandsRoot()

// 缓存机制
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry<unknown>>()
const DEFAULT_CACHE_TTL = 5 * 60 * 1000 // 5分钟

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCache<T>(key: string, data: T, ttl: number = DEFAULT_CACHE_TTL): void {
  cache.set(key, { data, timestamp: Date.now(), ttl })
}

function getDefaultValue(field: string, fallback: string): string {
  return fallback
}

// 验证 frontmatter 必需字段
function validateFrontmatter(
  data: Record<string, string>,
  filePath: string
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const result = { isValid: true, errors: [] as string[], warnings: [] as string[] }
  const requiredFields = ['name']

  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      result.errors.push(`Missing required field: ${field} in ${filePath}`)
      result.isValid = false
    }
  }

  return result
}

function parseFrontmatter(content: string): { data: Record<string, string>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: content }

  const yamlStr = match[1]
  const body = match[2]
  const data: Record<string, string> = {}
  const lines = yamlStr.split('\n')

  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '')
      data[key] = value
    }
  }

  return { data, body }
}

function extractWhenToUse(body: string): string[] {
  const lines = body.split('\n')
  const whenToUse: string[] = []
  let inWhenToUse = false

  for (const line of lines) {
    if (line.includes('## When to Activate') || line.includes('## When to Use')) {
      inWhenToUse = true
      continue
    }
    if (inWhenToUse) {
      if (line.startsWith('## ') || line.startsWith('# ')) break
      const trimmed = line.replace(/^[-*]\s*/, '').trim()
      if (trimmed && !trimmed.startsWith('|')) whenToUse.push(trimmed)
    }
  }

  return whenToUse
}

// 递归扫描目录
async function scanDirectoryRecursive(
  dirPath: string,
  filePattern: string,
  depth: number = 0,
  maxDepth: number = 3
): Promise<string[]> {
  const files: string[] = []

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory() && depth < maxDepth) {
        const subFiles = await scanDirectoryRecursive(fullPath, filePattern, depth + 1, maxDepth)
        files.push(...subFiles)
      } else if (entry.isFile() && entry.name === filePattern) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error)
  }

  return files
}

export async function getSkills(forceRefresh: boolean = false): Promise<Skill[]> {
  const cacheKey = 'skills'
  if (!forceRefresh) {
    const cached = getCached<Skill[]>(cacheKey)
    if (cached) return cached
  }

  const skills: Skill[] = []

  try {
    const skillFiles = await scanDirectoryRecursive(SKILLS_ROOT, 'SKILL.md')

    for (const skillPath of skillFiles) {
      try {
        const content = await fs.readFile(skillPath, 'utf-8')
        const { data, body } = parseFrontmatter(content)

        const validation = validateFrontmatter(data, skillPath)
        if (!validation.isValid) {
          console.error(`Validation failed for ${skillPath}:`, validation.errors)
        }

        const dirName = path.basename(path.dirname(skillPath))

        skills.push({
          id: dirName,
          name: data.name || getDefaultValue('name', dirName),
          description: data.description || getDefaultValue('description', '暂无描述'),
          origin: data.origin || getDefaultValue('origin', 'Unknown'),
          category: getCategory(dirName),
          level: getLevel(dirName),
          whenToUse: extractWhenToUse(body),
          filePath: skillPath,
        })
      } catch (error) {
        console.error(`Error reading skill file ${skillPath}:`, error)
      }
    }
  } catch (error) {
    console.error('Error scanning skills:', error)
  }

  const sortedSkills = skills.sort((a, b) => a.name.localeCompare(b.name))
  setCache(cacheKey, sortedSkills)
  return sortedSkills
}

export async function getAgents(forceRefresh: boolean = false): Promise<Agent[]> {
  const cacheKey = 'agents'
  if (!forceRefresh) {
    const cached = getCached<Agent[]>(cacheKey)
    if (cached) return cached
  }

  const agents: Agent[] = []

  try {
    const entries = await fs.readdir(AGENTS_ROOT, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue
      const agentPath = path.join(AGENTS_ROOT, entry.name)

      try {
        const content = await fs.readFile(agentPath, 'utf-8')
        const { data } = parseFrontmatter(content)

        agents.push({
          id: entry.name.replace('.md', ''),
          name: data.name || getDefaultValue('name', entry.name.replace('.md', '')),
          description: data.description || getDefaultValue('description', '暂无描述'),
          tools: data.tools ? data.tools.split(',').map((t) => t.trim()) : [],
          model: data.model || getDefaultValue('model', 'sonnet'),
          filePath: agentPath,
        })
      } catch (error) {
        console.error(`Error reading agent file ${agentPath}:`, error)
      }
    }
  } catch (error) {
    console.error('Error scanning agents:', error)
  }

  const sortedAgents = agents.sort((a, b) => a.name.localeCompare(b.name))
  setCache(cacheKey, sortedAgents)
  return sortedAgents
}

export async function getCommands(forceRefresh: boolean = false): Promise<Command[]> {
  const cacheKey = 'commands'
  if (!forceRefresh) {
    const cached = getCached<Command[]>(cacheKey)
    if (cached) return cached
  }

  const commands: Command[] = []

  try {
    const entries = await fs.readdir(COMMANDS_ROOT, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue
      const commandPath = path.join(COMMANDS_ROOT, entry.name)

      try {
        const content = await fs.readFile(commandPath, 'utf-8')
        const { data } = parseFrontmatter(content)

        commands.push({
          id: entry.name.replace('.md', ''),
          name: data.name || getDefaultValue('name', entry.name.replace('.md', '')),
          description: data.description || getDefaultValue('description', '暂无描述'),
          filePath: commandPath,
        })
      } catch (error) {
        console.error(`Error reading command file ${commandPath}:`, error)
      }
    }
  } catch (error) {
    console.error('Error scanning commands:', error)
  }

  const sortedCommands = commands.sort((a, b) => a.name.localeCompare(b.name))
  setCache(cacheKey, sortedCommands)
  return sortedCommands
}

// 并行获取所有数据
export async function getAll(): Promise<{
  skills: Skill[]
  agents: Agent[]
  commands: Command[]
}> {
  const [skills, agents, commands] = await Promise.all([
    getSkills(),
    getAgents(),
    getCommands(),
  ])

  return { skills, agents, commands }
}

// 获取统计数据
export async function getStats(): Promise<SkillStats> {
  const skills = await getSkills()

  const byCategory: Record<SkillCategory, number> = {
    framework: 0,
    database: 0,
    testing: 0,
    workflow: 0,
    business: 0,
    devops: 0,
    security: 0,
    language: 0,
    other: 0,
  }

  const byLevel: Record<SkillLevel, number> = {
    newbie: 0,
    intermediate: 0,
    advanced: 0,
  }

  for (const skill of skills) {
    byCategory[skill.category]++
    byLevel[skill.level]++
  }

  return {
    total: skills.length,
    byCategory,
    byLevel,
  }
}

// 根据 ID 获取技能
export async function getSkillById(id: string): Promise<Skill | null> {
  const skills = await getSkills()
  return skills.find((s) => s.id === id || s.name.toLowerCase() === id.toLowerCase()) || null
}

// 搜索技能
export async function searchSkills(query: string): Promise<SearchResult> {
  if (!query || query.trim() === '') {
    return { skills: [], agents: [], commands: [], total: 0 }
  }

  const [skills, agents, commands] = await Promise.all([
    getSkills(),
    getAgents(),
    getCommands(),
  ])

  const lowerQuery = query.toLowerCase()
  const searchTerms = lowerQuery.split(/\s+/).filter((t) => t.length > 0)

  // 搜索技能
  const matchedSkills = skills.filter((skill) => {
    const searchableText = [
      skill.id,
      skill.name,
      skill.description,
      skill.origin,
      skill.category,
      ...skill.whenToUse,
    ]
      .join(' ')
      .toLowerCase()

    return searchTerms.every((term) => searchableText.includes(term))
  })

  // 搜索 Agent
  const matchedAgents = agents.filter((agent) => {
    const searchableText = [agent.id, agent.name, agent.description, ...agent.tools]
      .join(' ')
      .toLowerCase()

    return searchTerms.every((term) => searchableText.includes(term))
  })

  // 搜索命令
  const matchedCommands = commands.filter((command) => {
    const searchableText = [command.id, command.name, command.description]
      .join(' ')
      .toLowerCase()

    return searchTerms.every((term) => searchableText.includes(term))
  })

  const total = matchedSkills.length + matchedAgents.length + matchedCommands.length

  return {
    skills: matchedSkills,
    agents: matchedAgents,
    commands: matchedCommands,
    total,
  }
}

// 清除缓存
export function clearCache(): void {
  cache.clear()
}
