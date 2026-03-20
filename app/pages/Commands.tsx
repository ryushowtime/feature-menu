'use client';

import { useState, useMemo, useRef, useEffect } from "react";
import { useStore } from "../../hooks/useStore";
import { GlowCard, Input, Button } from "../../components/ui";
import { Search, Terminal, Copy, Check, SearchX } from "lucide-react";
import { toast } from "sonner";

export function Commands() {
  const { commands } = useStore();
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const q = search.toLowerCase();
    return commands.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }, [commands, search]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("命令已复制到剪贴板");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Terminal className="h-8 w-8 text-primary" />
            命令
          </h1>
          <p className="text-muted-foreground mt-2">Claude Code 内置 CLI 命令。点击复制。</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="relative flex-1 max-w-xl group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            ref={searchInputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索命令... (按 '/' 聚焦)"
            className="pl-10 focus:ring-primary focus:border-primary focus:shadow-[0_0_10px_rgba(113,196,239,0.2)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        {filteredCommands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCommands.map(cmd => (
              <GlowCard
                key={cmd.id}
                className="group/card flex flex-col justify-between hover:border-primary/50 hover:shadow-[0_0_15px_rgba(113,196,239,0.1)] p-4 cursor-pointer"
                onClick={() => handleCopy(cmd.id, cmd.name)}
                interactive={false}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <code className="text-sm font-bold text-primary font-mono bg-primary/10 px-2 py-1 rounded-md border border-primary/20 flex-1 truncate">
                    {cmd.name}
                  </code>
                  <div className="shrink-0 p-1.5 rounded-md bg-muted text-muted-foreground group-hover/card:bg-primary/20 group-hover/card:text-primary transition-colors">
                    {copiedId === cmd.id ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {cmd.description}
                </p>
              </GlowCard>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <SearchX className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-xl font-medium text-foreground">未找到匹配的命令</h3>
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
