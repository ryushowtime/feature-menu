'use client'

import { useState, useMemo, useEffect } from 'react'

interface GlossaryProps {
  onClose: () => void
}

type TermCategory = 'basic' | 'intermediate' | 'advanced'

interface Term {
  term: string
  definition: string
  category: TermCategory
}

const terms: Term[] = [
  // 基础概念
  {
    term: 'Skill',
    definition: '预定义的工作流程和最佳实践，帮助 Claude Code 在特定领域提供更专业的指导。比如 tdd-workflow 会在你做 TDD 时提供详细指导。',
    category: 'basic',
  },
  {
    term: 'Agent',
    definition: '专业化的 AI 助手，专注于特定任务。比如 planner Agent 专门帮你做规划和任务分解。',
    category: 'basic',
  },
  {
    term: 'Command',
    definition: '可以通过斜杠 (/) 触发的快捷指令。比如 /plan 会启动 planner 来帮你制定计划。',
    category: 'basic',
  },
  {
    term: 'Hook',
    definition: '自动化脚本，在特定事件发生时自动执行。比如每次运行 Bash 前自动检查危险操作。',
    category: 'basic',
  },
  {
    term: 'MCP',
    definition: 'Model Context Protocol，Claude Code 与外部工具和服务集成的桥梁。',
    category: 'basic',
  },
  // 进阶概念
  {
    term: 'TDD',
    definition: 'Test-Driven Development，先写测试再写代码的开发方法，确保代码质量。',
    category: 'intermediate',
  },
  {
    term: 'E2E Testing',
    definition: 'End-to-End Testing，模拟真实用户行为，从头到尾测试整个应用程序流程。',
    category: 'intermediate',
  },
  {
    term: 'Code Review',
    definition: '代码审查，通过同行评审来提高代码质量和分享知识。',
    category: 'intermediate',
  },
  {
    term: 'Refactoring',
    definition: '重构，在不改变代码外在行为的前提下优化代码结构。',
    category: 'intermediate',
  },
  {
    term: 'CI/CD',
    definition: '持续集成/持续部署，自动化构建、测试和部署流程的实践。',
    category: 'intermediate',
  },
  {
    term: 'API Design',
    definition: 'API 设计，创建易用、一致且可扩展的应用程序接口。',
    category: 'intermediate',
  },
  {
    term: 'Frontend Patterns',
    definition: '前端模式，常用的前端开发架构和最佳实践解决方案。',
    category: 'intermediate',
  },
  // 专家概念
  {
    term: 'Security Review',
    definition: '安全审查，系统性地检查代码中的安全漏洞和风险。',
    category: 'advanced',
  },
  {
    term: 'Performance Optimization',
    definition: '性能优化，通过分析和技术手段提升系统响应速度和资源利用率。',
    category: 'advanced',
  },
  {
    term: 'System Design',
    definition: '系统设计，构建可扩展、高可用的分布式系统架构。',
    category: 'advanced',
  },
  {
    term: 'Architecture Pattern',
    definition: '架构模式，成熟的软件系统设计方案，如微服务、单体、事件驱动等。',
    category: 'advanced',
  },
  {
    term: 'DevOps',
    definition: '开发运维一体化，打破开发与运维边界，实现快速可靠的软件交付。',
    category: 'advanced',
  },
  {
    term: 'Infrastructure as Code',
    definition: '基础设施即代码，用代码管理服务器、网络等基础设施，实现自动化运维。',
    category: 'advanced',
  },
]

const categoryLabels: Record<TermCategory, string> = {
  basic: '基础概念',
  intermediate: '进阶概念',
  advanced: '专家概念',
}

const categoryColors: Record<TermCategory, string> = {
  basic: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
}

export default function Glossary({ onClose }: GlossaryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TermCategory | 'all'>('all')
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 200)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const filteredTerms = useMemo(() => {
    return terms.filter(t => {
      const matchesSearch = searchQuery === '' ||
        t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.definition.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const groupedTerms = useMemo(() => {
    const groups: Record<TermCategory, Term[]> = {
      basic: [],
      intermediate: [],
      advanced: [],
    }
    for (const term of filteredTerms) {
      groups[term.category].push(term)
    }
    return groups
  }, [filteredTerms])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 modal-backdrop" onClick={handleClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden glass ${isExiting ? 'modal-exit' : 'modal-enter'}`}>
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Glossary 术语表</h2>
            <p className="text-sm text-slate-500 mt-0.5">Claude Code 核心概念</p>
          </div>
          <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">✕</button>
        </div>

        {/* Search and Filter */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="搜索术语..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                selectedCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              全部
            </button>
            {(['basic', 'intermediate', 'advanced'] as TermCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  selectedCategory === cat ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-200px)] p-6">
          {selectedCategory === 'all' ? (
            // 按分类分组显示
            (['basic', 'intermediate', 'advanced'] as TermCategory[]).map(cat => {
              if (groupedTerms[cat].length === 0) return null
              return (
                <div key={cat} className="mb-6 last:mb-0">
                  <h3 className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mb-3 ${categoryColors[cat]}`}>
                    {categoryLabels[cat]}
                  </h3>
                  <div className="space-y-3">
                    {groupedTerms[cat].map(({ term, definition }) => (
                      <div key={term} className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100 hover:border-primary-200 transition-all hover:shadow-sm">
                        <h4 className="font-semibold text-slate-900 mb-1">{term}</h4>
                        <p className="text-sm text-slate-600">{definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            // 直接显示过滤后的术语
            <div className="space-y-3">
              {filteredTerms.map(({ term, definition, category }, index) => (
                <div
                  key={term}
                  className="stagger-item bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100 hover:border-primary-200 transition-all hover:shadow-sm"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{term}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs ${categoryColors[category]}`}>
                      {categoryLabels[category]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{definition}</p>
                </div>
              ))}
            </div>
          )}

          {filteredTerms.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              没有找到匹配的术语
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
