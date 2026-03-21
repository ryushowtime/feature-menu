import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import path from 'path';
import os from 'os';
import { Skill, Agent, Command, getCategory, getLevel, levelToDifficulty } from './types';

// 递归扫描目录查找 SKILL.md 文件
async function findSkillDirs(dirPath: string, depth: number = 0, maxDepth: number = 10): Promise<string[]> {
  const skillDirs: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // 跳过隐藏目录、node_modules 和 docs 目录
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'docs') {
        continue;
      }

      if (entry.isDirectory() && depth < maxDepth) {
        try {
          const skillFile = path.join(fullPath, 'SKILL.md');
          fsSync.accessSync(skillFile);
          skillDirs.push(fullPath);
        } catch {
          const subDirs = await findSkillDirs(fullPath, depth + 1, maxDepth);
          skillDirs.push(...subDirs);
        }
      }
    }
  } catch { /* skip */ }

  return skillDirs;
}

// 获取所有可能的根目录
function getAllRoots(): string[] {
  const homeDir = os.homedir();
  const roots: string[] = [];

  if (process.env.CLAUDE_CODE_ROOT) {
    roots.push(process.env.CLAUDE_CODE_ROOT);
  }

  const commonPaths = [
    path.join(homeDir, '.claude'),
    path.join(homeDir, 'everything-claude-code'),
    path.join(homeDir, 'Claude Code'),
    path.join(homeDir, 'claude-code'),
  ];

  for (const p of commonPaths) {
    try {
      fsSync.accessSync(p);
      roots.push(p);
    } catch { /* skip */ }
  }

  return [...new Set(roots)];
}

// 收集所有 skill 目录
async function collectAllSkillDirs(): Promise<string[]> {
  const roots = getAllRoots();
  const allDirs: string[] = [];

  for (const root of roots) {
    const dirs = await findSkillDirs(root);
    allDirs.push(...dirs);
  }

  return [...new Set(allDirs)];
}

// 缓存机制
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T, ttl: number = DEFAULT_CACHE_TTL): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

// 验证 frontmatter 必需字段
interface FrontmatterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validateFrontmatter(data: Record<string, string>, filePath: string): FrontmatterValidationResult {
  const result: FrontmatterValidationResult = { isValid: true, errors: [], warnings: [] };
  const requiredFields = ['name'];
  const optionalFields = ['description', 'origin', 'tools', 'model', 'command'];

  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      result.errors.push(`Missing required field: ${field} in ${filePath}`);
      result.isValid = false;
    }
  }

  for (const field of optionalFields) {
    if (!data[field] || data[field].trim() === '') {
      result.warnings.push(`Missing optional field: ${field} in ${filePath}`);
    }
  }

  return result;
}

function getDefaultValue(_field: string, fallback: string): string {
  return fallback;
}

// 解析 YAML frontmatter
function parseFrontmatter(content: string): { data: Record<string, string>, body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    return { data: {}, body: content };
  }

  const yamlStr = match[1];
  const body = match[2];

  const data: Record<string, string> = {};
  const lines = yamlStr.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      data[key] = value;
    }
  }

  return { data, body };
}

// 提取 When to Use 段落
function extractWhenToUse(body: string): string {
  const lines = body.split('\n');
  const whenToUseLines: string[] = [];
  let inWhenToUse = false;

  for (const line of lines) {
    if (line.includes('## When to Activate') || line.includes('## When to Use')) {
      inWhenToUse = true;
      continue;
    }
    if (inWhenToUse) {
      if (line.startsWith('## ') || line.startsWith('# ')) {
        break;
      }
      const trimmed = line.replace(/^[-*]\s*/, '').trim();
      if (trimmed && !trimmed.startsWith('|')) {
        whenToUseLines.push(trimmed);
      }
    }
  }

  return whenToUseLines.join(' ');
}

// 扫描单个技能文件
async function scanSkillFile(skillPath: string): Promise<Skill | null> {
  try {
    const content = await fs.readFile(skillPath, 'utf-8');
    const { data, body } = parseFrontmatter(content);

    const validation = validateFrontmatter(data, skillPath);
    if (!validation.isValid) {
      console.error(`Validation failed for ${skillPath}:`, validation.errors);
    }

    const dirName = path.basename(path.dirname(skillPath));
    const category = getCategory(dirName);
    const level = getLevel(dirName);

    return {
      id: dirName,
      name: data.name || getDefaultValue('name', dirName),
      description: data.description || getDefaultValue('description', '暂无描述'),
      category: category,
      difficulty: levelToDifficulty(level),
      whenToUse: extractWhenToUse(body),
      command: data.command || getDefaultValue('command', `/${dirName}`),
      related: [],
      filePath: skillPath,
    };
  } catch (error) {
    console.error(`Error reading skill file ${skillPath}:`, error);
    return null;
  }
}

// 扫描技能目录
export async function scanSkills(forceRefresh: boolean = false): Promise<Skill[]> {
  const cacheKey = 'skills';
  if (!forceRefresh) {
    const cached = getCached<Skill[]>(cacheKey);
    if (cached) return cached;
  }

  const skills: Skill[] = [];

  try {
    const skillDirs = await collectAllSkillDirs();
    console.log('[DEBUG] ===== scanSkills() start =====');
    console.log('[DEBUG] Roots:', getAllRoots());
    console.log('[DEBUG] Skill directories found:', skillDirs.length);
    skillDirs.forEach((d, i) => console.log(`  [${i}] ${d}`));

    const allSkillFiles: string[] = [];
    for (const dir of skillDirs) {
      const skillFile = path.join(dir, 'SKILL.md');
      try {
        fsSync.accessSync(skillFile);
        allSkillFiles.push(skillFile);
      } catch { /* skip */ }
    }
    console.log('[DEBUG] Total skill files found:', allSkillFiles.length);

    const results = await Promise.all(allSkillFiles.map(scanSkillFile));

    for (const skill of results) {
      if (skill) {
        skills.push(skill);
      }
    }
  } catch (error) {
    console.error('Error scanning skills:', error);
  }

  const sortedSkills = skills.sort((a, b) => a.name.localeCompare(b.name));
  setCache(cacheKey, sortedSkills);
  return sortedSkills;
}

// 扫描单个 agent 文件
async function scanAgentFile(agentPath: string): Promise<Agent | null> {
  try {
    const content = await fs.readFile(agentPath, 'utf-8');
    const { data } = parseFrontmatter(content);

    const validation = validateFrontmatter(data, agentPath);
    if (!validation.isValid) {
      console.error(`Validation failed for ${agentPath}:`, validation.errors);
    }

    const fileName = path.basename(agentPath);

    return {
      id: fileName.replace('.md', ''),
      name: data.name || getDefaultValue('name', fileName.replace('.md', '')),
      description: data.description || getDefaultValue('description', '暂无描述'),
      tools: data.tools ? data.tools.split(',').map((t: string) => t.trim()) : [],
      model: data.model || getDefaultValue('model', 'sonnet'),
      filePath: agentPath,
    };
  } catch (error) {
    console.error(`Error reading agent file ${agentPath}:`, error);
    return null;
  }
}

// 递归扫描 agents 目录
async function findAgentFiles(dirPath: string, depth: number = 0, maxDepth: number = 10): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'docs') {
        continue;
      }

      if (entry.isDirectory() && depth < maxDepth) {
        const subFiles = await findAgentFiles(fullPath, depth + 1, maxDepth);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch { /* skip */ }

  return files;
}

// 收集所有 agent 文件
async function collectAllAgentFiles(): Promise<string[]> {
  const roots = getAllRoots();
  const allFiles: string[] = [];

  for (const root of roots) {
    const agentsPath = path.join(root, 'agents');
    try {
      fsSync.accessSync(agentsPath);
      const files = await findAgentFiles(agentsPath);
      allFiles.push(...files);
    } catch { /* skip */ }
  }

  return [...new Set(allFiles)];
}

// 扫描 agents 目录
export async function scanAgents(forceRefresh: boolean = false): Promise<Agent[]> {
  const cacheKey = 'agents';
  if (!forceRefresh) {
    const cached = getCached<Agent[]>(cacheKey);
    if (cached) return cached;
  }

  const agents: Agent[] = [];

  try {
    const agentFiles = await collectAllAgentFiles();

    for (const agentPath of agentFiles) {
      const agent = await scanAgentFile(agentPath);
      if (agent) {
        agents.push(agent);
      }
    }
  } catch (error) {
    console.error('Error scanning agents:', error);
  }

  const sortedAgents = agents.sort((a, b) => a.name.localeCompare(b.name));
  setCache(cacheKey, sortedAgents);
  return sortedAgents;
}

// 扫描单个 command 文件
async function scanCommandFile(commandPath: string): Promise<Command | null> {
  try {
    const content = await fs.readFile(commandPath, 'utf-8');
    const { data } = parseFrontmatter(content);

    const validation = validateFrontmatter(data, commandPath);
    if (!validation.isValid) {
      console.error(`Validation failed for ${commandPath}:`, validation.errors);
    }

    const fileName = path.basename(commandPath);

    return {
      id: fileName.replace('.md', ''),
      name: data.name || getDefaultValue('name', fileName.replace('.md', '')),
      description: data.description || getDefaultValue('description', '暂无描述'),
      filePath: commandPath,
    };
  } catch (error) {
    console.error(`Error reading command file ${commandPath}:`, error);
    return null;
  }
}

// 递归扫描 commands 目录
async function findCommandFiles(dirPath: string, depth: number = 0, maxDepth: number = 10): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'docs') {
        continue;
      }

      if (entry.isDirectory() && depth < maxDepth) {
        const subFiles = await findCommandFiles(fullPath, depth + 1, maxDepth);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch { /* skip */ }

  return files;
}

// 收集所有 command 文件
async function collectAllCommandFiles(): Promise<string[]> {
  const roots = getAllRoots();
  const allFiles: string[] = [];

  for (const root of roots) {
    const commandsPath = path.join(root, 'commands');
    try {
      fsSync.accessSync(commandsPath);
      const files = await findCommandFiles(commandsPath);
      allFiles.push(...files);
    } catch { /* skip */ }
  }

  return [...new Set(allFiles)];
}

// 扫描 commands 目录
export async function scanCommands(forceRefresh: boolean = false): Promise<Command[]> {
  const cacheKey = 'commands';
  if (!forceRefresh) {
    const cached = getCached<Command[]>(cacheKey);
    if (cached) return cached;
  }

  const commands: Command[] = [];

  try {
    const commandFiles = await collectAllCommandFiles();

    for (const commandPath of commandFiles) {
      const command = await scanCommandFile(commandPath);
      if (command) {
        commands.push(command);
      }
    }
  } catch (error) {
    console.error('Error scanning commands:', error);
  }

  const sortedCommands = commands.sort((a, b) => a.name.localeCompare(b.name));
  setCache(cacheKey, sortedCommands);
  return sortedCommands;
}

// 并行扫描所有数据
export async function scanAll(forceRefresh: boolean = false): Promise<{
  skills: Skill[];
  agents: Agent[];
  commands: Command[];
}> {
  const [skills, agents, commands] = await Promise.all([
    scanSkills(forceRefresh),
    scanAgents(forceRefresh),
    scanCommands(forceRefresh),
  ]);

  return { skills, agents, commands };
}

// 清除缓存
export function clearCache(): void {
  cache.clear();
}
