'use client';

import { GlowCard, Badge } from '../../components/ui';
import {
  Wrench,
  Code2,
  GitBranch,
  Terminal,
  Package,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';

const TOOLS = [
  {
    id: 'vscode',
    name: 'VS Code',
    description: 'Claude Code IDE 集成，在 VS Code 中直接使用 Claude 的能力。',
    icon: Code2,
    color: '#007ACC',
  },
  {
    id: 'git',
    name: 'Git Hooks',
    description: '自动化的 Git hooks，在提交、推送等操作时触发 Claude Code。',
    icon: GitBranch,
    color: '#F05032',
  },
  {
    id: 'cli',
    name: 'CLI 工具',
    description: '命令行工具集，用于脚本和自动化任务。',
    icon: Terminal,
    color: '#4FC3F7',
  },
  {
    id: 'npm',
    name: 'npm 包',
    description: 'Node.js 包管理集成，追踪和管理项目依赖。',
    icon: Package,
    color: '#CB3837',
  },
  {
    id: 'files',
    name: '文件监听',
    description: '监控文件系统变化，自动触发相关工作流。',
    icon: FileCode,
    color: '#FFA726',
  },
  {
    id: 'components',
    name: '组件库',
    description: '预构建的 UI 组件，加速功能中心界面开发。',
    icon: Layers,
    color: '#66BB6A',
  },
];

export function Tools() {
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Wrench className="h-8 w-8 text-secondary" />
            工具
          </h1>
          <p className="text-muted-foreground mt-2">集成和扩展 Claude Code 功能的工具集。</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map(tool => {
            const Icon = tool.icon;
            return (
              <GlowCard
                key={tool.id}
                className="flex flex-col h-full hover:border-secondary/50 transition-colors"
                interactive={false}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border shrink-0"
                    style={{
                      backgroundColor: `${tool.color}15`,
                      borderColor: `${tool.color}30`,
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: tool.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg leading-tight">
                      {tool.name}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground flex-1">
                  {tool.description}
                </p>

                <div className="mt-6 pt-4 border-t border-border/50">
                  <Badge
                    variant="default"
                    className="bg-secondary/10 text-secondary border-secondary/30"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    即将推出
                  </Badge>
                </div>
              </GlowCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}