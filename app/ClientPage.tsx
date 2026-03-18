'use client'

import { useState, useEffect } from 'react'
import { Skill, SkillCategory, categoryNames } from '@/lib/types'
import { loadUsageData, toggleFavorite as toggleFavoriteUtil, recordUsage, getFavoriteSkills, getRecentSkills } from '@/lib/usage'
import Header from '@/components/Header'
import CategoryNav from '@/components/CategoryNav'
import SearchBar from '@/components/SearchBar'
import SkillCard from '@/components/SkillCard'
import SkillDetail from '@/components/SkillDetail'
import Onboarding from '@/components/Onboarding'
import TaskWizard from '@/components/TaskWizard'
import Glossary from '@/components/Glossary'
import FAQ from '@/components/FAQ'
import AgentCard from '@/components/AgentCard'
import CommandCard from '@/components/CommandCard'

interface ClientPageProps {
  skills: Skill[]
  agents: any[]
  commands: any[]
}

type Section = 'skills' | 'agents' | 'commands'

export default function ClientPage({ skills, agents, commands }: ClientPageProps) {
  const [section, setSection] = useState<Section>('skills')
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [showTaskWizard, setShowTaskWizard] = useState(false)
  const [showGlossary, setShowGlossary] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize from localStorage
  useEffect(() => {
    const data = loadUsageData()
    setFavorites(data.favorites)
    setIsInitialized(true)
  }, [])

  // Filter skills
  const filteredSkills = skills.filter(skill => {
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory
    const matchesSearch = searchQuery === '' ||
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    return searchQuery === '' ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Filter commands
  const filteredCommands = commands.filter(command => {
    return searchQuery === '' ||
      command.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.description.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const categories = [...new Set(skills.map(s => s.category))]

  const handleSectionChange = (newSection: Section) => {
    setSection(newSection)
    setSelectedCategory('all')
    setSearchQuery('')
  }

  const handleFavoriteToggle = (id: string) => {
    const data = toggleFavoriteUtil(id)
    setFavorites(data.favorites)
  }

  const handleSkillUse = (skill: Skill) => {
    recordUsage(skill.id)
    alert(`Skill "${skill.name}" 开始使用！\n\n在 Claude Code 中直接输入 /${skill.id} 来调用这个 Skill。`)
    setSelectedSkill(null)
  }

  const favoriteSkills = getFavoriteSkills(skills)
  const recentSkills = getRecentSkills(skills)
  const allCategories: (SkillCategory | 'all')[] = ['all', ...categories]

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse-slow">🔮</div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}

      <Header
        currentSection={section}
        onSectionChange={handleSectionChange}
        recentSkills={recentSkills}
        onRecentSkillClick={setSelectedSkill}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {section === 'skills' && '👋 欢迎使用功能中心'}
            {section === 'agents' && '🤖 代理'}
            {section === 'commands' && '⚡ 命令'}
          </h2>
          <p className="text-slate-600">
            {section === 'skills' && '浏览所有已安装的技能，获取基于任务的相关推荐'}
            {section === 'agents' && '专注于特定任务的专业化 AI 助手'}
            {section === 'commands' && '通过斜杠 (/) 快速触发的命令'}
          </p>
        </div>

        {/* Quick Actions - only show for skills section */}
        {section === 'skills' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setShowTaskWizard(true)}
              className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all"
            >
              <span className="text-2xl">🎯</span>
              <div className="text-left">
                <div className="font-medium text-slate-900">Task 推荐</div>
                <div className="text-xs text-slate-500">告诉我你想做什么 / Tell me your task</div>
              </div>
            </button>

            <button
              onClick={() => setShowGlossary(true)}
              className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all"
            >
              <span className="text-2xl">📖</span>
              <div className="text-left">
                <div className="font-medium text-slate-900">Glossary 术语表</div>
                <div className="text-xs text-slate-500">了解 Skill、Agent、Hook 的含义</div>
              </div>
            </button>

            <button
              onClick={() => setShowFAQ(true)}
              className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all"
            >
              <span className="text-2xl">❓</span>
              <div className="text-left">
                <div className="font-medium text-slate-900">FAQ 常见问题</div>
                <div className="text-xs text-slate-500">解答你关心的问题</div>
              </div>
            </button>

            <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-2xl">📊</span>
              <div className="text-left">
                <div className="font-medium text-slate-900">Stats 统计</div>
                <div className="text-xs text-slate-500">
                  {skills.length} Skills / {agents.length} Agents / {commands.length} Commands
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar - only show for skills section */}
          {section === 'skills' && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-slate-900 mb-3">📂 Categories 分类</h3>
                  <CategoryNav
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                </div>

                {favoriteSkills.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">⭐ Favorites 收藏</h3>
                    <div className="space-y-2">
                      {favoriteSkills.slice(0, 5).map(skill => (
                        <button
                          key={skill.id}
                          onClick={() => setSelectedSkill(skill)}
                          className="block w-full text-left px-2 py-1.5 text-sm text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors truncate"
                        >
                          {skill.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6">
              <SearchBar
                onSearch={setSearchQuery}
                placeholder={
                  section === 'skills' ? '搜索技能...' :
                  section === 'agents' ? '搜索代理...' :
                  '搜索命令...'
                }
              />
            </div>

            {/* Skills Section */}
            {section === 'skills' && (
              <>
                {favorites.length > 0 && searchQuery === '' && selectedCategory === 'all' && (
                  <section className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">⭐ Favorite Skills</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favoriteSkills.map(skill => (
                        <SkillCard
                          key={skill.id}
                          skill={skill}
                          isFavorite={true}
                          onFavoriteToggle={handleFavoriteToggle}
                          onClick={setSelectedSkill}
                        />
                      ))}
                    </div>
                  </section>
                )}

                
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      📚 {selectedCategory === 'all' ? 'All Skills' : categoryNames[selectedCategory]}
                    </h3>
                    <span className="text-sm text-slate-500">{filteredSkills.length} Skills</span>
                  </div>

                  {filteredSkills.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSkills.map(skill => (
                        <SkillCard
                          key={skill.id}
                          skill={skill}
                          isFavorite={favorites.includes(skill.id)}
                          onFavoriteToggle={handleFavoriteToggle}
                          onClick={setSelectedSkill}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
                      <div className="text-4xl mb-3">🔍</div>
                      <p className="text-slate-600">No matching Skills found</p>
                    </div>
                  )}
                </section>
              </>
            )}

            {/* Agents Section */}
            {section === 'agents' && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">All Agents</h3>
                  <span className="text-sm text-slate-500">{filteredAgents.length} Agents</span>
                </div>

                {filteredAgents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAgents.map(agent => (
                      <AgentCard key={agent.id} agent={agent} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-slate-600">No matching Agents found</p>
                  </div>
                )}
              </section>
            )}

            {/* Commands Section */}
            {section === 'commands' && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">All Commands</h3>
                  <span className="text-sm text-slate-500">{filteredCommands.length} Commands</span>
                </div>

                {filteredCommands.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCommands.map(command => (
                      <CommandCard key={command.id} command={command} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-slate-600">No matching Commands found</p>
                  </div>
                )}
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      {selectedSkill && (
        <SkillDetail
          skill={selectedSkill}
          isFavorite={favorites.includes(selectedSkill.id)}
          onFavoriteToggle={handleFavoriteToggle}
          onClose={() => setSelectedSkill(null)}
          onUse={handleSkillUse}
        />
      )}

      {showTaskWizard && (
        <TaskWizard
          skills={skills}
          onClose={() => setShowTaskWizard(false)}
          onSkillSelect={(skill) => {
            setSelectedSkill(skill)
            setShowTaskWizard(false)
          }}
        />
      )}

      {showGlossary && (
        <Glossary onClose={() => setShowGlossary(false)} />
      )}

      {showFAQ && (
        <FAQ onClose={() => setShowFAQ(false)} />
      )}
    </div>
  )
}
