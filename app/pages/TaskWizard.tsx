'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useStore } from "../../hooks/useStore";
import { GlowCard, Button, Badge } from "../../components/ui";
import { Sparkles, Code, Database, Globe, Rocket, ArrowRight, ArrowLeft, Bot, Play } from "lucide-react";
import { toast } from "sonner";

type TaskType = 'frontend' | 'backend' | 'database' | 'devops' | null;

export function TaskWizard() {
  const [step, setStep] = useState(1);
  const [taskType, setTaskType] = useState<TaskType>(null);
  const { skills, recordUsage } = useStore();
  const router = useRouter();

  const TASK_OPTIONS: { id: TaskType; title: string; icon: any; desc: string }[] = [
    { id: 'frontend', title: '前端开发', icon: Globe, desc: 'React、UI 组件、样式' },
    { id: 'backend', title: '后端 / API', icon: Code, desc: 'API 路由、逻辑、测试' },
    { id: 'database', title: '数据库与数据', icon: Database, desc: 'SQL、模式、数据迁移' },
    { id: 'devops', title: 'DevOps 与工作流', icon: Rocket, desc: 'CI/CD、git、自动化' },
  ];

  const getRecommendations = () => {
    switch (taskType) {
      case 'frontend': return skills.filter(s => s.category === 'framework' || s.category === 'workflow');
      case 'backend': return skills.filter(s => s.category === 'framework' || s.category === 'testing' || s.category === 'security');
      case 'database': return skills.filter(s => s.category === 'database');
      case 'devops': return skills.filter(s => s.category === 'devops' || s.category === 'workflow');
      default: return [];
    }
  };

  const handleUseSkill = (id: string) => {
    recordUsage(id);
    toast.success("使用记录已保存");
    router.push('/skills');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-6 shadow-[0_0_20px_rgba(113,196,239,0.2)]">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">任务推荐向导</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          告诉我们你想做什么，我们会为你的工作推荐最佳技能和代理。
        </p>
      </div>

      <div className="w-full relative">
        {/* Progress Bar */}
        <div className="absolute -top-12 left-0 right-0 flex items-center justify-center gap-2">
          <div className={`h-1.5 w-16 rounded-full ${step >= 1 ? 'bg-primary shadow-[0_0_10px_rgba(113,196,239,0.5)]' : 'bg-muted'}`} />
          <div className={`h-1.5 w-16 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-primary shadow-[0_0_10px_rgba(113,196,239,0.5)]' : 'bg-muted'}`} />
        </div>

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-xl font-medium mb-6 text-center">你正在做什么类型的任务？</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TASK_OPTIONS.map(option => (
                <GlowCard
                  key={option.id}
                  interactive
                  onClick={() => setTaskType(option.id)}
                  className={`p-6 border-2 transition-all ${taskType === option.id ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(113,196,239,0.2)]' : 'border-border/50'}`}
                >
                  <option.icon className={`h-8 w-8 mb-4 ${taskType === option.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <h3 className="text-lg font-bold text-foreground mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.desc}</p>
                </GlowCard>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <Button
                variant="primary"
                size="lg"
                disabled={!taskType}
                onClick={() => setStep(2)}
              >
                继续 <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-xl font-medium mb-2 text-center">推荐工具</h2>
            <p className="text-center text-muted-foreground mb-8">根据你的选择，以下是最佳使用工具。</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {getRecommendations().map(skill => (
                <GlowCard key={skill.id} className="p-5 flex flex-col justify-between" interactive={false}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-foreground">{skill.name}</h3>
                      <Badge variant="secondary">{skill.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{skill.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full hover:border-primary hover:text-primary" onClick={() => handleUseSkill(skill.id)}>
                    <Play className="h-4 w-4 mr-2" /> 开始使用
                  </Button>
                </GlowCard>
              ))}

              {/* Add a mock recommended agent */}
              <GlowCard className="p-5 flex flex-col justify-between border-[#a855f7]/30 bg-[#a855f7]/5" interactive={false}>
                 <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Bot className="h-5 w-5 text-[#a855f7]" />
                        {taskType === 'frontend' ? '前端架构师' : '专家代理'}
                      </h3>
                      <Badge variant="default" className="border-[#a855f7]/30 text-[#a855f7]">代理</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">切换到此代理以获得更专业的能力来完成当前任务。</p>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => router.push('/agents')}>
                    查看代理
                  </Button>
              </GlowCard>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-5 w-5" /> 返回
              </Button>
              <Button variant="primary" onClick={() => router.push('/skills')}>
                浏览所有技能
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
