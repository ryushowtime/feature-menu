'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '../components/ui';
import {
  LayoutDashboard,
  BookOpen,
  Bot,
  Terminal,
  Sparkles,
  HelpCircle,
  BarChart2,
} from 'lucide-react';

const navItems = [
  { name: '首页', href: '/', icon: LayoutDashboard },
  { name: '技能', href: '/skills', icon: BookOpen },
  { name: '代理', href: '/agents', icon: Bot },
  { name: '命令', href: '/commands', icon: Terminal },
  { name: '统计', href: '/stats', icon: BarChart2 },
];

const bottomItems = [
  { name: '任务向导', href: '/task-wizard', icon: Sparkles },
  { name: '帮助', href: '/help', icon: HelpCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-wider">
            <Bot className="h-6 w-6" />
            <span>功能中心</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
            导航
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_10px_rgba(113,196,239,0.1)]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}

          <div className="mt-8">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2 mt-8">
              工具
            </div>
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_10px_rgba(113,196,239,0.1)]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background relative selection:bg-primary/30">
        {/* Subtle grid background for cyberpunk feel */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="relative z-10 p-8 max-w-7xl mx-auto h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
