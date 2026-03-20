'use client';

import { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { Modal, Button } from '../components/ui';
import { Bot, Sparkles, Star } from 'lucide-react';

export function Onboarding() {
  const { state, completeOnboarding } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!state.hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, [state.hasSeenOnboarding]);

  const handleClose = () => {
    completeOnboarding();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md bg-card/95 backdrop-blur-xl border-primary/30">
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/30 shadow-[0_0_20px_rgba(113,196,239,0.3)]">
          {step === 1 && <Bot className="h-8 w-8 text-primary" />}
          {step === 2 && <Sparkles className="h-8 w-8 text-primary" />}
          {step === 3 && <Star className="h-8 w-8 text-warning" />}
        </div>

        <div className="min-h-[120px]">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-foreground mb-3">欢迎使用功能中心</h2>
              <p className="text-muted-foreground">
                探索和管理 Claude Code 强大技能、代理和命令的中心枢纽。
              </p>
            </div>
          )}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-foreground mb-3">不知道从哪开始？</h2>
              <p className="text-muted-foreground">
                使用<strong className="text-primary font-medium">任务推荐向导</strong>找到适合你当前项目需要的工具。
              </p>
            </div>
          )}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-foreground mb-3">收藏常用技能</h2>
              <p className="text-muted-foreground">
                点击任意技能上的星标图标，将其添加到收藏，方便从首页快速访问。
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-6 bg-primary' : 'w-2 bg-muted'}`} />
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleClose}>
              跳过
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (step < 3) setStep(step + 1);
                else handleClose();
              }}
            >
              {step < 3 ? '下一步' : '开始使用'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
