'use client';

import { useState } from "react";
import { GlowCard, Button } from "../../components/ui";
import { HelpCircle, Book, MessageCircleQuestion } from "lucide-react";

export function Help() {
  const [activeTab, setActiveTab] = useState<'faq' | 'glossary'>('faq');

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">帮助中心</h1>
          <p className="text-muted-foreground mt-1">了解如何有效使用 Claude Code。</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 p-1 bg-muted rounded-lg w-fit">
        <Button
          variant={activeTab === 'faq' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('faq')}
          className="h-10 px-6"
        >
          <MessageCircleQuestion className="h-4 w-4 mr-2" />
          常见问题
        </Button>
        <Button
          variant={activeTab === 'glossary' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('glossary')}
          className="h-10 px-6"
        >
          <Book className="h-4 w-4 mr-2" />
          术语表
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 pb-8 space-y-4">
        {activeTab === 'faq' ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <FaqItem
              question="如何使用技能？"
              answer="你可以通过点击任意技能卡片上的「开始使用」来使用技能。它会自动将相应的斜杠命令输入到你的活跃聊天会话中。"
            />
            <FaqItem
              question="技能和代理有什么区别？"
              answer="技能是执行特定操作的针对性命令或工作流程。代理是具有专用工具和上下文的自主 AI 实例，专为复杂的、多步骤问题解决而设计。"
            />
            <FaqItem
              question="我的收藏会被保存吗？"
              answer="会的！你的收藏和使用统计都保存在本地设备上，确保完全隐私。"
            />
            <FaqItem
              question="我可以创建自己的技能吗？"
              answer="目前技能通过官方插件安装。自定义用户定义技能的支持将在未来更新中推出。"
            />
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <GlossaryItem term="代理 (Agent)" definition="配置了特定系统提示、工具和模型的自主 AI 实例，用于处理复杂的专业任务。" />
            <GlossaryItem term="技能 (Skill)" definition="预定义的工作流程或命令宏，无需复杂提示即可快速执行特定操作。" />
            <GlossaryItem term="命令 (Command)" definition="以斜杠开头（如 /compact）的指令，用于控制 Claude Code 环境本身的行为。" />
            <GlossaryItem term="上下文窗口 (Context Window)" definition="AI 在单次对话中可以「记住」的文本/代码量。使用 /compact 等命令有助于管理这个。" />
          </div>
        )}
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  return (
    <GlowCard interactive={false} className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-start gap-2">
        <span className="text-primary mt-1">Q:</span> {question}
      </h3>
      <p className="text-muted-foreground pl-6 border-l-2 border-border/50 ml-1 mt-3">
        <span className="text-secondary font-medium mr-2">A:</span> {answer}
      </p>
    </GlowCard>
  );
}

function GlossaryItem({ term, definition }: { term: string, definition: string }) {
  return (
    <GlowCard interactive={false} className="p-6 flex flex-col md:flex-row md:items-start gap-4">
      <div className="w-48 shrink-0">
        <h3 className="text-lg font-bold text-primary">{term}</h3>
      </div>
      <div className="flex-1 text-muted-foreground">
        {definition}
      </div>
    </GlowCard>
  );
}
