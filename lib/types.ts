// 技能数据结构
export interface Skill {
  id: string
  name: string
  description: string
  origin: string
  category: SkillCategory
  level: SkillLevel
  whenToUse: string[]
  workflow?: string
  relatedSkills?: string[]
  filePath: string
}

export interface Agent {
  id: string
  name: string
  description: string
  tools: string[]
  model: string
  filePath: string
}

export interface Command {
  id: string
  name: string
  description: string
  filePath: string
}

export type SkillCategory =
  | 'framework'      // 开发框架
  | 'database'       // 数据库
  | 'testing'        // 测试
  | 'workflow'      // 工作流
  | 'business'       // 商业内容
  | 'devops'         // 运维部署
  | 'security'       // 安全
  | 'language'        // 编程语言
  | 'other'           // 其他

export type SkillLevel = 'newbie' | 'intermediate' | 'advanced'

// 分类映射 - 根据技能名称关键词分类
const categoryKeywords: Record<SkillCategory, string[]> = {
  framework: [
    'frontend', 'backend', 'api', 'patterns', 'html', 'css', 'react', 'next',
    'vue', 'angular', 'svelte', 'node', 'express', 'nest', 'fastapi', 'flask',
    'spring', 'django', 'rails', 'laravel', 'symfony', 'gatsby', 'nuxt', 'remix'
  ],
  database: [
    'database', 'postgres', 'postgresql', 'clickhouse', 'sql', 'mysql', 'mongodb',
    'redis', 'elasticsearch', 'sqlite', 'migration', 'orm', 'prisma', 'typeorm'
  ],
  testing: [
    'testing', 'tdd', 'e2e', 'test', 'pytest', 'junit', 'jest', 'vitest',
    'cypress', 'playwright', 'mocha', 'jasmine', 'unittest', 'pytest'
  ],
  workflow: [
    'workflow', 'continuous', 'agent', 'autonomous', 'eval', 'planning',
    'planner', 'task', 'breakdown', 'swe', 'code-review', 'review', 'debugging'
  ],
  business: [
    'business', 'investor', 'market', 'content', 'article', 'copywriting',
    'writing', 'pitch', 'deck', 'fundraising', 'startup', 'sales', 'marketing'
  ],
  devops: [
    'docker', 'deployment', 'cicd', 'hook', 'kubernetes', 'k8s', 'terraform',
    'ansible', 'jenkins', 'github-actions', 'gitlab-ci', 'ci-cd', 'cloud',
    'aws', 'gcp', 'azure', 'serverless'
  ],
  security: [
    'security', 'scan', 'review', 'vulnerability', 'audit', 'auth', 'oauth',
    'jwt', 'encryption', 'penetration', 'owasp', 'secure', 'saas'
  ],
  language: [
    'golang', 'python', 'java', 'swift', 'cpp', 'c++', 'typescript', 'javascript',
    'rust', 'ruby', 'php', 'kotlin', 'scala', 'r', 'matlab', 'dart', 'go'
  ],
  other: [],
}

// 分类映射 - 根据技能名称判断分类
export function getCategory(name: string): SkillCategory {
  const lowerName = name.toLowerCase()

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === 'other') continue
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category as SkillCategory
      }
    }
  }

  return 'other'
}

// 根据名称判断难度等级
export function getLevel(name: string): SkillLevel {
  const newbieKeywords = ['basic', 'intro', 'start', 'beginner', 'getting-started']
  const advancedKeywords = ['advanced', 'expert', 'master', 'pro', 'security', 'optimization']

  const lowerName = name.toLowerCase()

  for (const keyword of advancedKeywords) {
    if (lowerName.includes(keyword)) {
      return 'advanced'
    }
  }

  for (const keyword of newbieKeywords) {
    if (lowerName.includes(keyword)) {
      return 'newbie'
    }
  }

  return 'intermediate'
}

// 分类显示名称
export const categoryNames: Record<SkillCategory, string> = {
  framework: '开发框架',
  database: '数据库',
  testing: '测试',
  workflow: '工作流',
  business: '商业',
  devops: '运维',
  security: '安全',
  language: '编程语言',
  other: '其他',
}

// 等级显示名称
export const levelNames: Record<SkillLevel, string> = {
  newbie: '新手',
  intermediate: '进阶',
  advanced: '高级',
}

// 分类图标
export const categoryIcons: Record<SkillCategory, string> = {
  framework: '🧩',
  database: '🗄️',
  testing: '🧪',
  workflow: '⚙️',
  business: '💼',
  devops: '🚀',
  security: '🔒',
  language: '💻',
  other: '📦',
}

// 技能统计数据
export interface SkillStats {
  total: number
  byCategory: Record<SkillCategory, number>
  byLevel: Record<SkillLevel, number>
}

// 搜索结果
export interface SearchResult {
  skills: Skill[]
  agents: Agent[]
  commands: Command[]
  total: number
}
