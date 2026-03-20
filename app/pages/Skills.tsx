'use client';

import { useState, useMemo, useRef, useEffect } from "react";
import { useStore } from "../../hooks/useStore";
import { SkillCategory, Skill } from "../../lib/types";
import { GlowCard, Badge, Button, Input, Modal } from "../../components/ui";
import {
  Search, Star, SortAsc, Activity, X,
  Puzzle, Database, FlaskConical, Workflow, Briefcase,
  Rocket, Shield, Code, Box, BookOpen, Play
} from "lucide-react";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<SkillCategory, any> = {
  framework: Puzzle,
  database: Database,
  testing: FlaskConical,
  workflow: Workflow,
  business: Briefcase,
  devops: Rocket,
  security: Shield,
  language: Code,
  other: Box,
};

const DIFFICULTY_COLORS = {
  Newbie: 'success',
  Intermediate: 'warning',
  Advanced: 'danger',
} as const;

export function Skills() {
  const { skills, state, toggleFavorite, recordUsage } = useStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<SkillCategory | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'usage'>('name');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !selectedSkill) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedSkill]);

  const filteredSkills = useMemo(() => {
    let result = skills;

    if (activeCategory) {
      result = result.filter(s => s.category === activeCategory);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        const usageA = state.usageCount[a.id] || 0;
        const usageB = state.usageCount[b.id] || 0;
        return usageB - usageA;
      }
    });

    return result;
  }, [skills, search, activeCategory, sortBy, state.usageCount]);

  const handleFavorite = (e: React.MouseEvent, skillId: string) => {
    e.stopPropagation();
    const isFav = state.favorites.includes(skillId);
    toggleFavorite(skillId);
    if (isFav) {
      toast.success("已取消收藏");
    } else {
      toast.success("已添加到收藏");
    }
  };

  const handleUseSkill = (skill: Skill) => {
    recordUsage(skill.id);
    toast.success("使用记录已保存", { description: skill.command });
    setSelectedSkill(null);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            技能
          </h1>
          <p className="text-muted-foreground mt-2">浏览和管理所有可用的技能。</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            ref={searchInputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="按名称或描述搜索技能... (按 '/' 聚焦)"
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={sortBy === 'name' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSortBy('name')}
            className="h-10 px-4 whitespace-nowrap"
          >
            <SortAsc className="h-4 w-4 mr-2" />
            名称
          </Button>
          <Button
            variant={sortBy === 'usage' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSortBy('usage')}
            className="h-10 px-4 whitespace-nowrap"
          >
            <Activity className="h-4 w-4 mr-2" />
            使用量
          </Button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button
          variant={activeCategory === null ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveCategory(null)}
          className="rounded-full px-4 text-xs"
        >
          全部分类
        </Button>
        {(Object.keys(CATEGORY_ICONS) as SkillCategory[]).map(cat => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className="rounded-full px-4 text-xs border border-border/50 bg-card hover:bg-muted"
            >
              <Icon className="h-3.5 w-3.5 mr-2" />
              <span className="capitalize">{cat}</span>
              {activeCategory === cat && <X className="h-3 w-3 ml-2" />}
            </Button>
          );
        })}
      </div>

      {/* Skill Grid */}
      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        {filteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map(skill => {
              const Icon = CATEGORY_ICONS[skill.category];
              const isFav = state.favorites.includes(skill.id);

              return (
                <GlowCard
                  key={skill.id}
                  className="flex flex-col h-full group/card relative"
                  onClick={() => setSelectedSkill(skill)}
                >
                  <button
                    onClick={(e) => handleFavorite(e, skill.id)}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 z-10 ${isFav ? 'text-warning bg-warning/10' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    <Star className={`h-4 w-4 ${isFav ? 'fill-current shadow-[0_0_10px_rgba(234,179,8,0.5)]' : ''}`} />
                  </button>

                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shrink-0 shadow-[inset_0_0_10px_rgba(0,102,140,0.1)]">
                      <Icon className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="pr-8">
                      <h3 className="font-bold text-foreground text-lg leading-tight line-clamp-2 group-hover/card:text-primary transition-colors">{skill.name}</h3>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{skill.category}</Badge>
                        <Badge variant={DIFFICULTY_COLORS[skill.difficulty]} className="text-[10px] uppercase tracking-wider">
                          {skill.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground flex-1 line-clamp-3 leading-relaxed">
                    {skill.description}
                  </p>

                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                    <code className="text-xs bg-muted px-2 py-1 rounded-md text-primary font-mono select-all truncate max-w-[150px]">
                      {skill.command}
                    </code>
                    <span className="text-xs text-muted-foreground font-medium">
                      使用次数：{state.usageCount[skill.id] || 0}
                    </span>
                  </div>
                </GlowCard>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <Search className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-xl font-medium text-foreground">未找到匹配的技能</h3>
            <p className="text-muted-foreground mt-2">尝试调整搜索或分类筛选条件。</p>
            {(search || activeCategory) && (
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => { setSearch(''); setActiveCategory(null); }}
              >
                清除所有筛选
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Skill Details Modal */}
      {selectedSkill && (
        <Modal
          isOpen={!!selectedSkill}
          onClose={() => setSelectedSkill(null)}
          className="max-w-2xl bg-[#11111c] border-primary/30 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          {(() => {
            const Icon = CATEGORY_ICONS[selectedSkill.category];
            const isFav = state.favorites.includes(selectedSkill.id);

            return (
              <div className="relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex items-start justify-between relative z-10 mb-8 pt-2">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(113,196,239,0.2)]">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        {selectedSkill.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="px-3 py-1">{selectedSkill.category}</Badge>
                        <Badge variant={DIFFICULTY_COLORS[selectedSkill.difficulty]} className="px-3 py-1">
                          {selectedSkill.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="bg-card/50 p-4 rounded-xl border border-border/50">
                    <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> 描述
                    </h4>
                    <p className="text-foreground text-sm leading-relaxed">{selectedSkill.description}</p>
                  </div>

                  <div className="bg-card/50 p-4 rounded-xl border border-border/50">
                    <h4 className="text-sm font-semibold text-secondary mb-2 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> 使用场景
                    </h4>
                    <p className="text-foreground text-sm leading-relaxed">{selectedSkill.whenToUse}</p>
                  </div>

                  <div className="bg-muted p-4 rounded-xl border border-border/50 font-mono text-sm flex items-center justify-between group">
                    <div>
                      <span className="text-muted-foreground mr-2">$</span>
                      <span className="text-primary">{selectedSkill.command}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedSkill.command);
                        toast.success("命令已复制");
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      复制
                    </Button>
                  </div>

                  {selectedSkill.related.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3">相关技能</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkill.related.map(id => {
                          const relatedSkill = skills.find(s => s.id === id);
                          if (!relatedSkill) return null;
                          return (
                            <Badge key={id} variant="default" className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors" onClick={() => setSelectedSkill(relatedSkill)}>
                              {relatedSkill.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/50 mt-8">
                    <Button
                      variant="outline"
                      onClick={(e) => handleFavorite(e, selectedSkill.id)}
                      className={isFav ? "text-warning border-warning/30 hover:bg-warning/10" : ""}
                    >
                      <Star className={`h-4 w-4 mr-2 ${isFav ? 'fill-current' : ''}`} />
                      {isFav ? '已收藏' : '收藏技能'}
                    </Button>
                    <Button
                      variant="primary"
                      className="px-8 shadow-[0_0_15px_rgba(113,196,239,0.3)]"
                      onClick={() => handleUseSkill(selectedSkill)}
                    >
                      <Play className="h-4 w-4 mr-2 fill-current" />
                      开始使用
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
