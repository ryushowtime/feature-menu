'use client';

import { useState, useMemo, useRef, useEffect } from "react";
import { useStore } from "../../hooks/useStore";
import { GlowCard, Badge, Input, Button } from "../../components/ui";
import { Search, Bot, Wrench, Cpu, SearchX } from "lucide-react";

export function Agents() {
  const { agents } = useStore();
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredAgents = useMemo(() => {
    if (!search) return agents;
    const q = search.toLowerCase();
    return agents.filter(a => a.name.toLowerCase().includes(q));
  }, [agents, search]);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Bot className="h-8 w-8 text-[#a855f7]" />
            代理
          </h1>
          <p className="text-muted-foreground mt-2">具有专用工具和模型的专业 AI 代理。</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="relative flex-1 max-w-xl group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#a855f7] transition-colors" />
          <Input
            ref={searchInputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="按名称搜索代理... (按 '/' 聚焦)"
            className="pl-10 focus:ring-[#a855f7] focus:border-[#a855f7] focus:shadow-[0_0_10px_rgba(168,85,247,0.2)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        {filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map(agent => (
              <GlowCard
                key={agent.id}
                className="flex flex-col h-full hover:border-[#a855f7] hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] group/card"
                interactive={false}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 flex items-center justify-center border border-[#a855f7]/20 shrink-0">
                    <Bot className="h-6 w-6 text-[#a855f7]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg leading-tight group-hover/card:text-[#a855f7] transition-colors">{agent.name}</h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Cpu className="h-3 w-3" />
                      {agent.model}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground flex-1 mb-6">
                  {agent.description}
                </p>

                <div className="mt-auto">
                  <h4 className="text-xs font-semibold text-[#a855f7] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5" /> 可用工具
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.tools.map((tool, i) => (
                      <Badge key={i} variant="default" className="bg-card border border-border/50 text-xs py-1 text-muted-foreground hover:bg-[#a855f7]/10 hover:text-[#a855f7] hover:border-[#a855f7]/30 transition-colors">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <SearchX className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-xl font-medium text-foreground">未找到匹配的代理</h3>
            <p className="text-muted-foreground mt-2">尝试调整搜索条件。</p>
            {search && (
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => setSearch('')}
              >
                清除搜索
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
