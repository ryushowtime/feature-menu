'use client'

import { useRef, useEffect, useState } from 'react'
import { SkillCategory, categoryNames, categoryIcons } from '@/lib/types'

interface CategoryNavProps {
  categories: SkillCategory[]
  selectedCategory: SkillCategory | 'all'
  onCategoryChange: (category: SkillCategory | 'all') => void
}

export default function CategoryNav({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryNavProps) {
  const [indicatorStyle, setIndicatorStyle] = useState<{ top: number; height: number }>({ top: 0, height: 0 })
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  // Update indicator position when selected category changes
  useEffect(() => {
    const key = selectedCategory
    const button = buttonRefs.current.get(key)
    if (button && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const buttonRect = button.getBoundingClientRect()
      setIndicatorStyle({
        top: buttonRect.top - containerRect.top,
        height: buttonRect.height
      })
    }
  }, [selectedCategory])

  const allCategories: (SkillCategory | 'all')[] = ['all', ...categories]

  return (
    <nav className="space-y-1 relative" ref={containerRef}>
      {/* Sliding indicator */}
      <div
        className="absolute left-0 w-1 bg-primary-500 rounded-full category-indicator"
        style={{
          top: indicatorStyle.top,
          height: indicatorStyle.height,
          transition: 'top 0.25s cubic-bezier(0.4, 0, 0.2, 1), height 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      <button
        ref={(el) => {
          if (el) buttonRefs.current.set('all', el)
        }}
        onClick={() => onCategoryChange('all')}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors relative z-10 ${
          selectedCategory === 'all'
            ? 'text-primary-600 font-medium'
            : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        📚 所有技能
      </button>

      {categories.map(category => (
        <button
          key={category}
          ref={(el) => {
            if (el) buttonRefs.current.set(category, el)
          }}
          onClick={() => onCategoryChange(category)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 relative z-10 ${
            selectedCategory === category
              ? 'text-primary-600 font-medium'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>{categoryIcons[category]}</span>
          <span>{categoryNames[category]}</span>
        </button>
      ))}
    </nav>
  )
}
