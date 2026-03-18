'use client'

import { Skill } from '@/lib/types'
import RecentDropdown from './RecentDropdown'

type Section = 'skills' | 'agents' | 'commands'

interface HeaderProps {
  currentSection: Section
  onSectionChange: (section: Section) => void
  recentSkills: Skill[]
  onRecentSkillClick: (skill: Skill) => void
}

export default function Header({ currentSection, onSectionChange, recentSkills, onRecentSkillClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              🔮
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Claude Code 功能中心</h1>
              <p className="text-xs text-slate-500">技能与插件管理</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSectionChange('skills')}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                currentSection === 'skills'
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-slate-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              📚 技能
            </button>
            <button
              onClick={() => onSectionChange('agents')}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                currentSection === 'agents'
                  ? 'bg-purple-100 text-purple-700 font-medium'
                  : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              🤖 代理
            </button>
            <button
              onClick={() => onSectionChange('commands')}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                currentSection === 'commands'
                  ? 'bg-amber-100 text-amber-700 font-medium'
                  : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50'
              }`}
            >
              ⚡ 命令
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <RecentDropdown recentSkills={recentSkills} onSkillClick={onRecentSkillClick} />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 pb-3 -mt-1">
          <button
            onClick={() => onSectionChange('skills')}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors text-center ${
              currentSection === 'skills'
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'text-slate-600 hover:bg-primary-50'
            }`}
          >
            📚 技能
          </button>
          <button
            onClick={() => onSectionChange('agents')}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors text-center ${
              currentSection === 'agents'
                ? 'bg-purple-100 text-purple-700 font-medium'
                : 'text-slate-600 hover:bg-purple-50'
            }`}
          >
            🤖 代理
          </button>
          <button
            onClick={() => onSectionChange('commands')}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors text-center ${
              currentSection === 'commands'
                ? 'bg-amber-100 text-amber-700 font-medium'
                : 'text-slate-600 hover:bg-amber-50'
            }`}
          >
            ⚡ 命令
          </button>
        </div>
      </div>
    </header>
  )
}
