'use client'

import { useState } from 'react'
import { Skill, categoryIcons, categoryNames, levelNames } from '@/lib/types'

interface SkillCardProps {
  skill: Skill
  isFavorite?: boolean
  onFavoriteToggle?: (id: string) => void
  onClick?: (skill: Skill) => void
}

export default function SkillCard({ skill, isFavorite, onFavoriteToggle, onClick }: SkillCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isBouncing, setIsBouncing] = useState(false)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsBouncing(true)
    onFavoriteToggle?.(skill.id)
    setTimeout(() => setIsBouncing(false), 400)
  }

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 card-hover cursor-pointer relative overflow-hidden"
      onClick={() => onClick?.(skill)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover overlay with "查看详情" hint */}
      <div
        className={`absolute inset-0 bg-primary-500/90 flex items-center justify-center transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-white font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          查看详情
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryIcons[skill.category]}</span>
            <div>
              <h3 className="font-semibold text-slate-900">{skill.name}</h3>
              <span className="text-xs text-slate-500">{categoryNames[skill.category]}</span>
            </div>
          </div>

          {onFavoriteToggle && (
            <button
              onClick={handleFavoriteClick}
              className={`text-xl transition-all btn-ripple ${
                isFavorite ? 'text-yellow-500' : 'text-slate-300 hover:text-yellow-400'
              } ${isBouncing ? 'favorite-bounce' : ''}`}
            >
              {isFavorite ? '★' : '☆'}
            </button>
          )}
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {skill.description}
        </p>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full border ${
              skill.level === 'newbie'
                ? 'badge-newbie'
                : skill.level === 'intermediate'
                ? 'badge-intermediate'
                : 'badge-advanced'
            }`}
          >
            {levelNames[skill.level]}
          </span>
          <span className="text-xs text-slate-400">
            使用 {skill.whenToUse.length} 个场景
          </span>
        </div>
      </div>
    </div>
  )
}
