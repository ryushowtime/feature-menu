'use client'

import { useState, useRef, useEffect } from 'react'
import { Skill } from '@/lib/types'

interface RecentDropdownProps {
  recentSkills: Skill[]
  onSkillClick: (skill: Skill) => void
}

export default function RecentDropdown({ recentSkills, onSkillClick }: RecentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  if (recentSkills.length === 0) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
      >
        <span>🕐</span>
        <span className="hidden sm:inline">最近使用</span>
        <span className="text-xs text-slate-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <h4 className="font-medium text-slate-900 text-sm">最近使用的技能</h4>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recentSkills.map(skill => (
              <div
                key={skill.id}
                className="relative"
                onMouseEnter={() => setHoveredSkill(skill)}
                onMouseLeave={() => setHoveredSkill(null)}
              >
                <button
                  onClick={() => {
                    onSkillClick(skill)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <div className="font-medium text-slate-900 text-sm">{skill.name}</div>
                  <div className="text-xs text-slate-500 truncate">{skill.description}</div>
                </button>

                {hoveredSkill?.id === skill.id && (
                  <div className="absolute left-full top-0 ml-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 p-3 z-50">
                    <h5 className="font-semibold text-slate-900 text-sm mb-1">{hoveredSkill.name}</h5>
                    <p className="text-xs text-slate-600 mb-2">{hoveredSkill.description}</p>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-0.5 bg-slate-100 rounded">{hoveredSkill.category}</span>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 rounded">{hoveredSkill.level}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
