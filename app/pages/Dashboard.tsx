'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '../../hooks/useStore';
import { GlowCard, Badge, Button } from '../../components/ui';
import {
  BookOpen,
  Bot,
  Terminal,
  Star,
  Clock,
  Sparkles,
} from 'lucide-react';

export function Dashboard() {
  const {
    skills,
    agents,
    commands,
    recentlyUsed,
    favoriteSkills,
  } = useStore();
  const router = useRouter();

  return (
    <div className="flex-1 overflow-y-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary pb-2">
          首页
        </h1>
        <p className="text-muted-foreground">
          欢迎使用 Claude Code 功能中心。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="技能总数"
          value={skills.length}
          icon={BookOpen}
          onClick={() => router.push('/skills')}
        />
        <StatsCard
          title="活跃代理"
          value={agents.length}
          icon={Bot}
          onClick={() => router.push('/agents')}
        />
        <StatsCard
          title="命令"
          value={commands.length}
          icon={Terminal}
          onClick={() => router.push('/commands')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Used */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              最近使用
            </h2>
          </div>

          {recentlyUsed.length > 0 ? (
            <div className="space-y-3">
              {recentlyUsed.map((skill) => (
                <GlowCard
                  key={skill.id}
                  className="p-4 flex items-center justify-between"
                  onClick={() => router.push('/skills')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {skill.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {skill.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="primary">
                    {skill.category}
                  </Badge>
                </GlowCard>
              ))}
            </div>
          ) : (
            <GlowCard interactive={false} className="p-8 flex flex-col items-center justify-center text-center border-dashed border-border/50">
              <Clock className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                暂无使用记录。
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => router.push('/skills')}
              >
                浏览技能
              </Button>
            </GlowCard>
          )}
        </div>

        {/* Favorites */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" />
              收藏
            </h2>
          </div>

          {favoriteSkills.length > 0 ? (
            <div className="space-y-3">
              {favoriteSkills.map((skill) => (
                <GlowCard
                  key={skill.id}
                  className="p-4 flex items-center justify-between"
                  onClick={() => router.push('/skills')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center border border-warning/20">
                      <Star className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {skill.name}
                      </p>
                      <Badge
                        variant="warning"
                        className="mt-1 text-[10px] px-1.5 py-0"
                      >
                        {skill.difficulty}
                      </Badge>
                    </div>
                  </div>
                </GlowCard>
              ))}
            </div>
          ) : (
            <GlowCard interactive={false} className="p-8 flex flex-col items-center justify-center text-center border-dashed border-border/50">
              <Star className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                暂无收藏。
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                点击任意技能上的 ☆ 将其添加到此处。
              </p>
            </GlowCard>
          )}
        </div>
      </div>

      <div className="mt-12">
        <GlowCard
          className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-secondary/10 border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-6"
          onClick={() => router.push('/task-wizard')}
        >
          <div>
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              任务推荐向导
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              不确定使用哪个工具？回答几个简单问题，我们会为你的特定任务推荐最佳技能和代理。
            </p>
          </div>
          <Button variant="primary" className="shrink-0">
            启动向导
          </Button>
        </GlowCard>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, onClick }: { title: string; value: number; icon: any; onClick: () => void }) {
  return (
    <GlowCard onClick={onClick} className="group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
            {title}
          </p>
          <p className="text-3xl font-bold mt-2 text-foreground">
            {value}
          </p>
        </div>
        <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/20 transition-colors border border-transparent group-hover:border-primary/30">
          <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </GlowCard>
  );
}
