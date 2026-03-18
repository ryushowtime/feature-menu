'use client'

import { useState, useEffect } from 'react'
import { Skill } from '@/lib/types'
import { getTaskSuggestions, recommendSkills } from '@/lib/recommend'
import SkillCard from './SkillCard'

interface TaskWizardProps {
  skills: Skill[]
  onClose: () => void
  onSkillSelect: (skill: Skill) => void
}

export default function TaskWizard({ skills, onClose, onSkillSelect }: TaskWizardProps) {
  const [step, setStep] = useState<'select' | 'results'>('select')
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<Skill[]>([])
  const [isExiting, setIsExiting] = useState(false)

  const tasks = getTaskSuggestions()

  const handleTaskSelect = (task: string) => {
    setSelectedTask(task)
    const recommended = recommendSkills(task, skills)
    setRecommendations(recommended)
    setStep('results')
  }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 modal-backdrop" onClick={handleClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden glass ${isExiting ? 'modal-exit' : 'modal-enter'}`}>
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">🎯 任务推荐</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {step === 'select' ? '选择任务类型，系统会推荐合适的技能' : `基于 "${selectedTask}" 的技能推荐`}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">✕</button>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6">
          {step === 'select' ? (
            <>
              <p className="text-slate-600 mb-4 text-sm">选择任务类型，系统会推荐最合适的技能组合。</p>
              <div className="grid grid-cols-2 gap-3">
                {tasks.map(task => (
                  <button
                    key={task}
                    onClick={() => handleTaskSelect(task)}
                    className="p-4 text-left bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-300 rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <span className="font-medium text-slate-800">{task}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <p className="text-slate-600">
                基于 <strong>"{selectedTask}"</strong> 任务，为你推荐以下技能：
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((skill, index) => (
                  <div key={skill.id} className="stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
                    <SkillCard skill={skill} onClick={onSkillSelect} />
                  </div>
                ))}
              </div>
              {recommendations.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p>没有找到匹配的技能</p>
                  <button onClick={() => setStep('select')} className="mt-2 text-primary-500 hover:underline">重新选择任务</button>
                </div>
              )}
              <div className="flex justify-center">
                <button onClick={() => setStep('select')} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">← 重新选择</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
