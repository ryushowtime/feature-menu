'use client'

import { useState, useEffect, useCallback } from 'react'

interface OnboardingProps {
  onComplete: () => void
}

const STORAGE_KEY = 'feature-menu-onboarding'

interface OnboardingState {
  completed: boolean
  currentStep: number
  lastShown: string
}

const steps = [
  {
    icon: '👋',
    title: '欢迎使用功能中心',
    description: '这里集中管理你所有已安装的插件和技能，一目了然。',
  },
  {
    icon: '🔍',
    title: '浏览和搜索技能',
    description: '按分类查看或搜索你需要的技能，每个技能都有详细的使用说明。按 / 键可快速打开搜索。',
  },
  {
    icon: '🎯',
    title: '任务推荐功能',
    description: '告诉我们你的任务（如"开发网站"或"写测试"），我们推荐最合适的技能组合。',
  },
  {
    icon: '⭐',
    title: '收藏常用技能',
    description: '把最常用的技能收藏起来，方便快速访问。点击技能卡片上的星标即可收藏。',
  },
  {
    icon: '⌨️',
    title: '键盘快捷键',
    description: '使用快捷键提升效率：/ 打开搜索，f 收藏技能，esc 关闭弹窗。',
  },
  {
    icon: '📚',
    title: '开始探索',
    description: '现在你可以开始探索所有可用的技能和工具了！有问题可以查看 FAQ。',
  },
]

function loadState(): OnboardingState | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch {
    return null
  }
}

function saveState(state: OnboardingState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

function resetOnboarding() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)

  // Load saved state on mount
  useEffect(() => {
    const saved = loadState()
    if (saved && !saved.completed) {
      setCurrentStep(saved.currentStep)
    }
  }, [])

  // Save progress on step change
  useEffect(() => {
    saveState({
      completed: false,
      currentStep,
      lastShown: new Date().toISOString(),
    })
  }, [currentStep])

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      saveState({ completed: true, currentStep: 0, lastShown: new Date().toISOString() })
      onComplete()
    }
  }, [currentStep, onComplete])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleSkip = useCallback(() => {
    saveState({ completed: true, currentStep: 0, lastShown: new Date().toISOString() })
    onComplete()
  }, [onComplete])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleSkip()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev, handleSkip])

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            {currentStep + 1} / {steps.length}
          </p>
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{step.icon}</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{step.title}</h2>
          <p className="text-slate-600">{step.description}</p>
        </div>

        {/* Keyboard shortcuts hint */}
        {currentStep === 4 && (
          <div className="mb-6 bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-700 mb-2">⌨️ 快捷键</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">/</kbd> 搜索</div>
              <div><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">f</kbd> 收藏</div>
              <div><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">←</kbd> 上一步</div>
              <div><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">→</kbd> 下一步</div>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-primary-500' : index < currentStep ? 'bg-primary-300' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              上一步
            </button>
          )}
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            跳过
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            {isLastStep ? '开始使用' : '下一步'}
          </button>
        </div>

        {/* Reset button for testing */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              resetOnboarding()
              setCurrentStep(0)
            }}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            重置引导
          </button>
        </div>
      </div>
    </div>
  )
}
