import { Skill, SkillCategory } from './types'

// 简单的中文分词
function tokenize(text: string): string[] {
  // 简单的中英文混合分词
  const tokens: string[] = []
  const chineseChars: string[] = []

  for (const char of text.toLowerCase()) {
    if (/[\u4e00-\u9fa5]/.test(char)) {
      chineseChars.push(char)
    } else if (/[a-z0-9]/.test(char)) {
      if (chineseChars.length > 0) {
        tokens.push(chineseChars.join(''))
        chineseChars.length = 0
      }
      tokens.push(char)
    } else {
      if (chineseChars.length > 0) {
        tokens.push(chineseChars.join(''))
        chineseChars.length = 0
      }
    }
  }

  if (chineseChars.length > 0) {
    tokens.push(chineseChars.join(''))
  }

  return tokens
}

// 计算两个集合的 Jaccard 相似度
function jaccardSimilarity(set1: string[], set2: string[]): number {
  const intersection = set1.filter(item => set2.includes(item)).length
  const union = new Set([...set1, ...set2]).size
  return union > 0 ? intersection / union : 0
}

// TF-IDF 风格的简单关键词提取
function extractKeywords(text: string): string[] {
  const tokens = tokenize(text)
  const wordCount: Record<string, number> = {}

  // 常见停用词
  const stopWords = new Set(['的', '了', '和', '是', '在', '有', '我', '你', '他', '她', '它', '这', '那', '来', '去', '也', '都', '而', '及', '与', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'or', 'for', 'in', 'on', 'at', 'by', 'with', 'from'])

  for (const token of tokens) {
    if (token.length > 1 && !stopWords.has(token)) {
      wordCount[token] = (wordCount[token] || 0) + 1
    }
  }

  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)
}

// 技能相关组（组合推荐）
const skillGroups: Record<string, string[]> = {
  '前端开发': ['frontend-slides', 'frontend-patterns', 'react', 'css', 'ui-design'],
  '后端开发': ['backend-patterns', 'api-design', 'database', 'security'],
  '测试': ['tdd-workflow', 'e2e-testing', 'testing-best-practices'],
  '代码质量': ['code-review', 'tdd-workflow', 'refactoring'],
  '安全': ['security-review', 'security-scan', 'vulnerability-assessment'],
  '部署': ['deployment', 'docker', 'cicd', 'hooks'],
}

// 使用频率记录（用于热门技能标记）
let usageStats: Record<string, number> = {}

// 设置使用统计数据
export function setUsageStats(stats: Record<string, number>) {
  usageStats = stats
}

// 获取热门技能
export function getHotSkills(allSkills: Skill[], limit: number = 5): Skill[] {
  return Object.entries(usageStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => allSkills.find(s => s.id === id))
    .filter((s): s is Skill => s !== undefined)
}

// 基于语义匹配的推荐
export function semanticMatch(task: string, allSkills: Skill[]): Skill[] {
  const taskKeywords = extractKeywords(task)
  const taskTokens = tokenize(task.toLowerCase())

  if (taskTokens.length === 0) return []

  const scored = allSkills.map(skill => {
    const skillTokens = tokenize(`${skill.name} ${skill.description} ${skill.id}`.toLowerCase())
    const skillKeywords = extractKeywords(`${skill.name} ${skill.description} ${skill.id}`)

    // 计算多个相似度指标
    const tokenSimilarity = jaccardSimilarity(taskTokens, skillTokens)

    // 关键词匹配分数
    let keywordScore = 0
    for (const taskKw of taskKeywords) {
      for (const skillKw of skillKeywords) {
        if (taskKw.includes(skillKw) || skillKw.includes(taskKw)) {
          keywordScore += 1
        }
      }
    }
    const maxKeywordScore = Math.max(taskKeywords.length, skillKeywords.length)
    const normalizedKeywordScore = maxKeywordScore > 0 ? keywordScore / maxKeywordScore : 0

    // 综合分数
    const score = tokenSimilarity * 0.6 + normalizedKeywordScore * 0.4

    return { skill, score }
  })

  return scored
    .filter(s => s.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(s => s.skill)
}

// 组合推荐 - 推荐相关技能组
export function recommendSkillGroup(task: string, allSkills: Skill[]): Skill[] {
  // 查找匹配的任务组
  const matchedGroups: string[] = []

  for (const [groupName, groupSkills] of Object.entries(skillGroups)) {
    const groupKeywords = groupName.split('').join(' ')
    const combined = `${groupName} ${groupKeywords}`.toLowerCase()

    for (const token of tokenize(task.toLowerCase())) {
      if (combined.includes(token)) {
        matchedGroups.push(groupName)
        break
      }
    }
  }

  if (matchedGroups.length === 0) return []

  // 收集组内所有技能
  const groupSkillIds = new Set<string>()
  for (const groupName of matchedGroups) {
    for (const skillId of skillGroups[groupName] || []) {
      groupSkillIds.add(skillId)
    }
  }

  return allSkills
    .filter(s => groupSkillIds.has(s.id))
    .slice(0, 4)
}

// 任务到技能的映射
const taskSkillMapping: Record<string, { categories: SkillCategory[], keywords: string[] }> = {
  '网站开发': {
    categories: ['framework'],
    keywords: ['frontend', 'backend', 'api', 'patterns', 'html', 'css', 'react', 'next'],
  },
  '前端开发': {
    categories: ['framework'],
    keywords: ['frontend', 'react', 'css', 'html', 'slides', 'ui'],
  },
  '后端开发': {
    categories: ['framework', 'database'],
    keywords: ['backend', 'api', 'django', 'springboot', 'golang', 'python', 'java'],
  },
  '数据库': {
    categories: ['database'],
    keywords: ['postgres', 'database', 'sql', 'clickhouse', 'migration'],
  },
  '测试': {
    categories: ['testing'],
    keywords: ['testing', 'tdd', 'e2e', 'test', 'pytest', 'junit'],
  },
  'API设计': {
    categories: ['framework'],
    keywords: ['api', 'design', 'rest'],
  },
  '安全审查': {
    categories: ['security'],
    keywords: ['security', 'scan', 'review', 'vulnerability'],
  },
  '代码审查': {
    categories: ['workflow'],
    keywords: ['code', 'review', 'quality', 'patterns'],
  },
  '部署运维': {
    categories: ['devops'],
    keywords: ['docker', 'deployment', 'ci', 'cd', 'hook'],
  },
  '移动开发': {
    categories: ['language'],
    keywords: ['swift', 'ios', 'android', 'mobile'],
  },
  '数据工程': {
    categories: ['database'],
    keywords: ['data', 'pipeline', 'etl', 'clickhouse', 'analytics'],
  },
  '文案写作': {
    categories: ['business'],
    keywords: ['article', 'content', 'writing', 'copy'],
  },
  '投资融资': {
    categories: ['business'],
    keywords: ['investor', 'pitch', 'deck', 'fundraising'],
  },
  '市场调研': {
    categories: ['business'],
    keywords: ['market', 'research', 'analysis', 'competitor'],
  },
  'TDD开发': {
    categories: ['testing', 'workflow'],
    keywords: ['tdd', 'test', 'testing', 'workflow'],
  },
  '规划任务': {
    categories: ['workflow'],
    keywords: ['plan', 'planner', 'task', 'breakdown'],
  },
  '重构代码': {
    categories: ['workflow', 'language'],
    keywords: ['refactor', 'refactoring', 'clean', 'improve', 'code quality'],
  },
  '性能优化': {
    categories: ['framework', 'language'],
    keywords: ['performance', 'optimize', 'speed', 'cache', 'profiling'],
  },
  '编写文档': {
    categories: ['workflow'],
    keywords: ['doc', 'documentation', 'readme', 'comment', 'api doc'],
  },
  'Bug修复': {
    categories: ['workflow', 'testing'],
    keywords: ['bug', 'fix', 'debug', 'issue', 'error', 'troubleshoot'],
  },
  '创建演示': {
    categories: ['framework', 'business'],
    keywords: ['slides', 'presentation', 'demo', 'ppt', 'keynote'],
  },
  '代码分析': {
    categories: ['workflow', 'security'],
    keywords: ['analyze', 'analysis', 'metric', 'quality', 'lint'],
  },
  '学习新技术': {
    categories: ['language', 'framework'],
    keywords: ['learn', 'study', 'tutorial', 'guide', 'new'],
  },
}

// 通用推荐
const generalSkills: string[] = [
  'tdd-workflow',
  'code-review',
  'planning',
  'search-first',
  'brainstorming',
]

export function getTaskSuggestions(): string[] {
  return Object.keys(taskSkillMapping)
}

// 综合推荐函数 - 结合多种推荐策略
export function recommendSkills(task: string, allSkills: Skill[]): Skill[] {
  const mapping = taskSkillMapping[task]

  let results: Skill[] = []

  if (mapping) {
    const { categories, keywords } = mapping

    // 计算每个技能的相关性分数
    const scored = allSkills.map(skill => {
      let score = 0

      // 分类匹配
      if (categories.includes(skill.category)) {
        score += 3
      }

      // 关键词匹配
      const lowerName = skill.id.toLowerCase()
      for (const keyword of keywords) {
        if (lowerName.includes(keyword.toLowerCase())) {
          score += 2
        }
      }

      // 描述匹配
      const lowerDesc = skill.description.toLowerCase()
      for (const keyword of keywords) {
        if (lowerDesc.includes(keyword.toLowerCase())) {
          score += 1
        }
      }

      return { skill, score }
    })

    results = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(s => s.skill)
  }

  // 如果精确匹配结果不足，使用语义匹配补充
  if (results.length < 4) {
    const semanticResults = semanticMatch(task, allSkills)
    const existingIds = new Set(results.map(s => s.id))
    const supplemental = semanticResults.filter(s => !existingIds.has(s.id)).slice(0, 4 - results.length)
    results = [...results, ...supplemental]
  }

  // 如果仍然不足，添加热门技能
  if (results.length < 4) {
    const hotSkills = getHotSkills(allSkills, 6)
    const existingIds = new Set(results.map(s => s.id))
    const supplemental = hotSkills.filter(s => !existingIds.has(s.id)).slice(0, 4 - results.length)
    results = [...results, ...supplemental]
  }

  return results.slice(0, 6)
}

// 获取带热门标记的技能列表
export function getSkillsWithHotBadge(allSkills: Skill[], limit: number = 3): Skill[] {
  const hotSkills = getHotSkills(allSkills, limit)
  return hotSkills
}
