import { promises as fs } from 'fs'
import * as fsSync from 'fs'
import path from 'path'
import os from 'os'
import { Skill, Agent, Command, SkillCategory, getCategory, getLevel } from './types'

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
      // 检查是否存在 skills 目录
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
      if (parent === searchDir) break // 已到达根目录
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

  // 回退到默认路径（相对于项目目录）
  const fallback = path.join(process.cwd(), '../..')
  console.warn(`[Feature Menu] 未检测到 Claude Code 目录，使用默认路径: ${fallback}`)
  return fallback
}

const CLAUDE_CODE_ROOT = getClaudeCodeRoot()
const SKILLS_ROOT = path.join(CLAUDE_CODE_ROOT, 'skills')
const AGENTS_ROOT = path.join(CLAUDE_CODE_ROOT, 'agents')
const COMMANDS_ROOT = path.join(CLAUDE_CODE_ROOT, 'commands')

// 缓存机制
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // 毫秒
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

// 验证 frontmatter 必需字段
interface FrontmatterValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

function validateFrontmatter(data: Record<string, string>, filePath: string): FrontmatterValidationResult {
  const result: FrontmatterValidationResult = { isValid: true, errors: [], warnings: [] }
  const requiredFields = ['name']
  const optionalFields = ['description', 'origin', 'tools', 'model']

  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      result.errors.push(`Missing required field: ${field} in ${filePath}`)
      result.isValid = false
    }
  }

  for (const field of optionalFields) {
    if (!data[field] || data[field].trim() === '') {
      result.warnings.push(`Missing optional field: ${field} in ${filePath}`)
    }
  }

  return result
}

// 提供默认值处理缺失字段
function getDefaultValue(field: string, fallback: string): string {
  return fallback
}

// 解析 YAML frontmatter
function parseFrontmatter(content: string): { data: Record<string, string>, body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)

  if (!match) {
    return { data: {}, body: content }
  }

  const yamlStr = match[1]
  const body = match[2]

  // 简单解析 YAML (不支持复杂结构)
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

// 提取 When to Use 段落
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
      if (line.startsWith('## ') || line.startsWith('# ')) {
        break
      }
      const trimmed = line.replace(/^[-*]\s*/, '').trim()
      if (trimmed && !trimmed.startsWith('|')) {
        whenToUse.push(trimmed)
      }
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
        // 递归扫描子目录
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

// 扫描单个技能文件
async function scanSkillFile(skillPath: string): Promise<Skill | null> {
  try {
    const content = await fs.readFile(skillPath, 'utf-8')
    const { data, body } = parseFrontmatter(content)

    // 验证 frontmatter
    const validation = validateFrontmatter(data, skillPath)
    if (!validation.isValid) {
      console.error(`Validation failed for ${skillPath}:`, validation.errors)
    }
    if (validation.warnings.length > 0) {
      console.warn(`Validation warnings for ${skillPath}:`, validation.warnings)
    }

    const dirName = path.basename(path.dirname(skillPath))

    return {
      id: dirName,
      name: data.name || getDefaultValue('name', dirName),
      description: data.description || getDefaultValue('description', '暂无描述'),
      origin: data.origin || getDefaultValue('origin', 'Unknown'),
      category: getCategory(dirName),
      level: getLevel(dirName),
      whenToUse: extractWhenToUse(body),
      filePath: skillPath,
    }
  } catch (error) {
    console.error(`Error reading skill file ${skillPath}:`, error)
    return null
  }
}

// 扫描技能目录
export async function scanSkills(forceRefresh: boolean = false): Promise<Skill[]> {
  const cacheKey = 'skills'
  if (!forceRefresh) {
    const cached = getCached<Skill[]>(cacheKey)
    if (cached) return cached
  }

  const skills: Skill[] = []

  try {
    // 递归扫描 skills 目录，查找 SKILL.md 文件
    const skillFiles = await scanDirectoryRecursive(SKILLS_ROOT, 'SKILL.md')

    // 并行扫描所有技能文件
    const results = await Promise.all(skillFiles.map(scanSkillFile))

    for (const skill of results) {
      if (skill) {
        skills.push(skill)
      }
    }
  } catch (error) {
    console.error('Error scanning skills:', error)
  }

  const sortedSkills = skills.sort((a, b) => a.name.localeCompare(b.name))
  setCache(cacheKey, sortedSkills)
  return sortedSkills
}

// 扫描单个 agent 文件
async function scanAgentFile(agentPath: string): Promise<Agent | null> {
  try {
    const content = await fs.readFile(agentPath, 'utf-8')
    const { data } = parseFrontmatter(content)

    // 验证 frontmatter
    const validation = validateFrontmatter(data, agentPath)
    if (!validation.isValid) {
      console.error(`Validation failed for ${agentPath}:`, validation.errors)
    }

    const fileName = path.basename(agentPath)

    return {
      id: fileName.replace('.md', ''),
      name: data.name || getDefaultValue('name', fileName.replace('.md', '')),
      description: data.description || getDefaultValue('description', '暂无描述'),
      tools: data.tools ? data.tools.split(',').map(t => t.trim()) : [],
      model: data.model || getDefaultValue('model', 'sonnet'),
      filePath: agentPath,
    }
  } catch (error) {
    console.error(`Error reading agent file ${agentPath}:`, error)
    return null
  }
}

// 扫描 agents 目录
export async function scanAgents(forceRefresh: boolean = false): Promise<Agent[]> {
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
      const agent = await scanAgentFile(agentPath)
      if (agent) {
        agents.push(agent)
      }
    }
  } catch (error) {
    console.error('Error scanning agents:', error)
  }

  const sortedAgents = agents.sort((a, b) => a.name.localeCompare(b.name))
  setCache(cacheKey, sortedAgents)
  return sortedAgents
}

// 扫描单个 command 文件
async function scanCommandFile(commandPath: string): Promise<Command | null> {
  try {
    const content = await fs.readFile(commandPath, 'utf-8')
    const { data } = parseFrontmatter(content)

    // 验证 frontmatter
    const validation = validateFrontmatter(data, commandPath)
    if (!validation.isValid) {
      console.error(`Validation failed for ${commandPath}:`, validation.errors)
    }

    const fileName = path.basename(commandPath)

    return {
      id: fileName.replace('.md', ''),
      name: data.name || getDefaultValue('name', fileName.replace('.md', '')),
      description: data.description || getDefaultValue('description', '暂无描述'),
      filePath: commandPath,
    }
  } catch (error) {
    console.error(`Error reading command file ${commandPath}:`, error)
    return null
  }
}

// 扫描 commands 目录
export async function scanCommands(forceRefresh: boolean = false): Promise<Command[]> {
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
      const command = await scanCommandFile(commandPath)
      if (command) {
        commands.push(command)
      }
    }
  } catch (error) {
    console.error('Error scanning commands:', error)
  }

  const sortedCommands = commands.sort((a, b) => a.name.localeCompare(b.name))
  setCache(cacheKey, sortedCommands)
  return sortedCommands
}

// 并行扫描所有数据
export async function scanAll(forceRefresh: boolean = false): Promise<{
  skills: Skill[]
  agents: Agent[]
  commands: Command[]
}> {
  const [skills, agents, commands] = await Promise.all([
    scanSkills(forceRefresh),
    scanAgents(forceRefresh),
    scanCommands(forceRefresh),
  ])

  return { skills, agents, commands }
}

// 清除缓存
export function clearCache(): void {
  cache.clear()
}
