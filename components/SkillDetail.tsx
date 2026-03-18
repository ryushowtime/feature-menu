'use client'

import { useState, useEffect } from 'react'
import { Skill, categoryIcons, categoryNames, levelNames } from '@/lib/types'

interface SkillDetailProps {
  skill: Skill
  isFavorite?: boolean
  onFavoriteToggle?: (id: string) => void
  onClose: () => void
  onUse?: (skill: Skill) => void
}

export default function SkillDetail({
  skill,
  isFavorite,
  onFavoriteToggle,
  onClose,
  onUse,
}: SkillDetailProps) {
  const [isBouncing, setIsBouncing] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 200)
  }

  const handleFavoriteClick = () => {
    setIsBouncing(true)
    onFavoriteToggle?.(skill.id)
    setTimeout(() => setIsBouncing(false), 400)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 modal-backdrop transition-opacity" onClick={handleClose} />

      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden ${
          isExiting ? 'modal-exit' : 'modal-enter'
        }`}
      >
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{categoryIcons[skill.category]}</span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{skill.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                  {categoryNames[skill.category]}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded border ${
                  skill.level === 'newbie' ? 'badge-newbie' : skill.level === 'intermediate' ? 'badge-intermediate' : 'badge-advanced'
                }`}>
                  {levelNames[skill.level]}
                </span>
                <span className="text-xs text-slate-400">Origin: {skill.origin}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6">
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</h3>
            <p className="text-slate-700">{skill.description}</p>
          </section>

          {skill.whenToUse.length > 0 && (
            <section className="mb-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">When to Use</h3>
              <ul className="space-y-2">
                {skill.whenToUse.map((场景, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span className="text-slate-700">{场景}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mb-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">How to Use</h3>
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100">
              <p className="text-slate-700 text-sm">
                在 Claude Code 中，当你需要 <strong className="text-primary-600">{skill.name}</strong> 相关的帮助时，系统会自动识别并推荐使用此技能。
              </p>
              <p className="text-slate-600 text-sm mt-2">
                你也可以手动触发它：
              </p>
              <code className="mt-2 block bg-slate-800 text-slate-100 px-3 py-2 rounded-lg text-sm font-mono">/{skill.id}</code>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-slate-100 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleFavoriteClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all btn-ripple ${
              isFavorite
                ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            } ${isBouncing ? 'favorite-bounce' : ''}`}
          >
            {isFavorite ? '★ 已收藏' : '☆ 收藏'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              关闭
            </button>
            <button
              onClick={() => onUse?.(skill)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all hover:shadow-lg hover:shadow-primary-500/25 btn-ripple"
            >
              开始使用
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
