'use client'

import { useState } from 'react'

interface FAQProps {
  onClose: () => void
}

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: '如何安装新技能？',
    answer: '在 Claude Code 中使用 /skill 命令或直接在 skills 目录下添加新的 skill 文件。新技能会自动被扫描并显示在功能中心。',
  },
  {
    question: '如何贡献技能？',
    answer: '1. 在 skills 目录下创建新的 skill 文件\n2. 按照 skill 格式编写 YAML frontmatter\n3. 包含 name、description、whenToUse 等必要字段\n4. 提交 PR 到项目仓库',
  },
  {
    question: '如何使用推荐的技能？',
    answer: '点击技能卡片上的"使用"按钮，会显示在 Claude Code 中调用该技能的命令。通常是以斜杠 (/) 开头的命令，如 /tdd-workflow。',
  },
  {
    question: '如何收藏常用技能？',
    answer: '点击技能卡片上的星标图标即可收藏。收藏的技能会显示在侧边栏的 Favorites 区域，方便快速访问。',
  },
  {
    question: '任务推荐是如何工作的？',
    answer: '输入你的任务描述（如"我想开发一个网站"），系统会分析任务关键词，匹配相关的技能分类和描述，返回最合适的技能推荐。',
  },
  {
    question: '如何查看术语解释？',
    answer: '点击功能中心的"Glossary 术语表"按钮，可以查看所有核心概念的详细解释，包括 Skill、Agent、Command、Hook 等。',
  },
  {
    question: '支持哪些编程语言和框架？',
    answer: '支持主流编程语言：JavaScript/TypeScript、Python、Go、Java、Swift 等。框架支持包括 React、Next.js、Django、Spring Boot 等。',
  },
  {
    question: '如何报告问题或提出建议？',
    answer: '可以在 GitHub 仓库提交 Issue，或者使用 /feedback 命令直接反馈。我们欢迎任何改进建议！',
  },
]

export default function FAQ({ onClose }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 modal-backdrop" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-fadeIn">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">FAQ 常见问题</h2>
            <p className="text-sm text-slate-500 mt-0.5">快速解答你的疑问</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">✕</button>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6">
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium text-slate-900">{item.question}</span>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              没有找到答案？试试 <button className="text-primary-600 hover:underline" onClick={onClose}>Glossary 术语表</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
