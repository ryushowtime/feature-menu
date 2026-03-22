'use client';

import { useState, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { GlowCard, Badge, Button, Card } from '../../components/ui';
import {
  Activity,
  TrendingUp,
  Server,
  CheckCircle2,
  BarChart2,
  PieChart as PieChartIcon,
  RefreshCw,
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import recharts to avoid SSR issues
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });

const COLORS = ['#71C4EF', '#FF5733', '#C70039', '#900C3F', '#581845', '#1abc9c', '#f1c40f'];

export function Stats() {
  const [mounted, setMounted] = useState(false);
  const { state, topSkills, totalUsageCount, toggleHook } = useStore();
  const { isHookEnabled } = state;

  // Avoid hydration mismatch - only render dynamic content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate category distribution
  const categoryCount = topSkills.reduce((acc, skill) => {
    acc[skill.category] = (acc[skill.category] || 0) + skill.usage;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  // Take top 3 for the bar chart
  const barChartData = topSkills.slice(0, 3).map(s => ({
    name: s.name,
    uses: s.usage
  }));

  return (
    <div className="flex-1 overflow-y-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary pb-2">
          使用统计
        </h1>
        <p className="text-muted-foreground">
          监控技能调用情况和 Claude Code 集成指标。
        </p>
      </div>

      {/* Hook Status Banner */}
      <GlowCard className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-background/50 backdrop-blur-md border-primary/20">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${isHookEnabled ? 'bg-success/10 border-success/30 text-success' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
            <Server className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              PostToolUse Hook 状态
              {isHookEnabled ? (
                <Badge variant="success" className="px-2 py-0 h-5 text-[10px] uppercase tracking-wider">已启用</Badge>
              ) : (
                <Badge variant="danger" className="px-2 py-0 h-5 text-[10px] uppercase tracking-wider">已禁用</Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isHookEnabled
                ? "正在从 ~/.claude/skills-usage.json 追踪使用数据"
                : "使用追踪已暂停，Hook 数据未在收集。"}
            </p>
          </div>
        </div>
        <Button
          variant={isHookEnabled ? "outline" : "primary"}
          onClick={toggleHook}
          className="shrink-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isHookEnabled ? '' : 'animate-spin'}`} />
          {isHookEnabled ? "禁用追踪" : "启用追踪"}
        </Button>
      </GlowCard>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlowCard className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">总调用次数</p>
              <p className="text-4xl font-black mt-2 text-foreground font-mono">{mounted ? totalUsageCount.toLocaleString() : '—'}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <Activity className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-success" />
            <span className="text-success font-medium">活跃</span> 跨 {mounted ? topSkills.length : 0} 个技能
          </div>
        </GlowCard>

        <GlowCard className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">已使用技能数</p>
              <p className="text-4xl font-black mt-2 text-foreground font-mono">{mounted ? topSkills.length : '—'}</p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-xl border border-secondary/20">
              <Server className="h-6 w-6 text-secondary" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-secondary" />
            共 {mounted ? (state.usageCount ? Object.keys(state.usageCount).length : 0) : 0} 个追踪项目
          </div>
        </GlowCard>

        <GlowCard className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">最常用分类</p>
              <p className="text-2xl font-bold mt-2 text-foreground truncate max-w-[150px]">
                {mounted ? (pieData.length > 0 ? pieData[0].name : "无数据") : "—"}
              </p>
            </div>
            <div className="p-3 bg-warning/10 rounded-xl border border-warning/20">
              <PieChartIcon className="h-6 w-6 text-warning" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
            {mounted ? (pieData.length > 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-warning" />
                <span className="text-warning font-medium">{pieData[0].value}</span> 次使用此分类
              </>
            ) : (
              "暂无数据"
            )) : "—"}
          </div>
        </GlowCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 10 Bar Chart */}
        <Card className="p-6 border-border/50">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium">Top 3 使用最多的技能</h2>
          </div>
          {mounted && barChartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{fill: '#ffffff0a'}}
                    contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#3b3c3d', borderRadius: '8px' }}
                    itemStyle={{ color: '#71C4EF' }}
                  />
                  <Bar dataKey="uses" fill="#71C4EF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center flex-col text-muted-foreground opacity-50">
              <BarChart2 className="h-12 w-12 mb-4" />
              <p>暂无使用数据</p>
            </div>
          )}
        </Card>

        {/* Category Distribution */}
        <Card className="p-6 border-border/50">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="h-5 w-5 text-secondary" />
            <h2 className="text-lg font-medium">分类使用分布</h2>
          </div>
          {mounted && pieData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#3b3c3d', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center flex-col text-muted-foreground opacity-50">
              <PieChartIcon className="h-12 w-12 mb-4" />
              <p>暂无分类数据</p>
            </div>
          )}
        </Card>
      </div>

      {/* Top 20 Detailed List */}
      <div className="space-y-4">
        <h2 className="text-xl font-medium flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Top 3 排行榜
        </h2>

        {mounted && topSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topSkills.slice(0, 3).map((skill, i) => (
              <GlowCard key={skill.id} className="p-4 flex items-center justify-between group hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-warning/20 text-warning border border-warning/50' :
                    i === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/50' :
                    i === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/50' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{skill.name}</h4>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{skill.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="primary" className="bg-primary/5">{skill.category}</Badge>
                  <span className="text-sm font-bold text-foreground font-mono">{skill.usage} <span className="text-[10px] text-muted-foreground font-sans font-normal">次</span></span>
                </div>
              </GlowCard>
            ))}
          </div>
        ) : (
          <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-border/50">
            <Activity className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg text-foreground mb-2">暂未追踪到使用数据</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              当你在 Claude Code 中开始使用工具时，调用次数将显示在这里。数据通过 PostToolUse Hook 自动同步。
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
