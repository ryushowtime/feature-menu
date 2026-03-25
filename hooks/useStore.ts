'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Skill, Agent, Command } from '../lib/types';

// Merge local and Claude Code usage counts
function mergeUsageCount(
  local: Record<string, number>,
  claude: Record<string, number>
): Record<string, number> {
  const merged = { ...local };
  for (const [skillId, count] of Object.entries(claude)) {
    merged[skillId] = (merged[skillId] || 0) + count;
  }
  return merged;
}

// 从 scanner 生成的 ID 中提取 skill 名称
// 格式: "brainstorming@skills-ecc/superpowers/brainstorming-SKILL.md" -> "brainstorming"
// 格式: "agent-reach@skills-agent-reach-SKILL.md" -> "agent-reach"
function extractSkillName(scannerId: string): string {
  const atIndex = scannerId.indexOf('@');
  if (atIndex > 0) {
    return scannerId.substring(0, atIndex);
  }
  return scannerId;
}

// 根据 skill 名称查找使用次数（支持 scanner ID 和纯名称两种格式）
function lookupUsage(mergedUsageCount: Record<string, number>, scannerId: string): number {
  // 先尝试直接匹配（纯名称格式）
  if (mergedUsageCount[scannerId] !== undefined) {
    return mergedUsageCount[scannerId];
  }
  // 再尝试从 scanner ID 提取名称后匹配
  const skillName = extractSkillName(scannerId);
  return mergedUsageCount[skillName] || 0;
}

export interface AppState {
  favorites: string[]; // Skill IDs
  usageCount: Record<string, number>; // Skill ID -> count (local only)
  hasSeenOnboarding: boolean;
  isHookEnabled: boolean; // Whether to track usage via hook
}

const STORAGE_KEY = 'claude-code-feature-menu-v1';

const getInitialState = (): AppState => {
  if (typeof window === 'undefined') {
    return { favorites: [], usageCount: {}, hasSeenOnboarding: false, isHookEnabled: true };
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...parsed, isHookEnabled: parsed.isHookEnabled ?? true };
    } catch (e) {
      console.error('Failed to parse state', e);
    }
  }
  return { favorites: [], usageCount: {}, hasSeenOnboarding: false, isHookEnabled: true };
};

export const useStore = () => {
  const [state, setState] = useState<AppState>(getInitialState);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claudeUsageCount, setClaudeUsageCount] = useState<Record<string, number>>({});
  const [claudeRecent, setClaudeRecent] = useState<string[]>([]);

  // Load scanned data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/scan');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setSkills(data.skills || []);
        setAgents(data.agents || []);
        setCommands(data.commands || []);
      } catch (error) {
        console.error('Failed to scan data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Load Claude Code usage data from hook-collected stats
  useEffect(() => {
    const loadClaudeUsage = async () => {
      try {
        const response = await fetch('/api/usage');
        if (response.ok) {
          const data = await response.json();
          setClaudeUsageCount(data.stats || {});
          setClaudeRecent(data.recent || []);
        }
      } catch (error) {
        console.error('Failed to load Claude usage:', error);
      }
    };
    loadClaudeUsage();

    // Poll for updates every 30 seconds
    const interval = setInterval(loadClaudeUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const toggleFavorite = useCallback((skillId: string) => {
    setState(prev => {
      const isFav = prev.favorites.includes(skillId);
      return {
        ...prev,
        favorites: isFav
          ? prev.favorites.filter(id => id !== skillId)
          : [...prev.favorites, skillId]
      };
    });
  }, []);

  const recordUsage = useCallback((skillId: string) => {
    setState(prev => ({
      ...prev,
      usageCount: {
        ...prev.usageCount,
        [skillId]: (prev.usageCount[skillId] || 0) + 1
      }
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState(prev => ({ ...prev, hasSeenOnboarding: true }));
  }, []);

  const toggleHook = useCallback(() => {
    setState(prev => ({ ...prev, isHookEnabled: !prev.isHookEnabled }));
  }, []);

  // Derived state - merge local and Claude Code usage counts
  const mergedUsageCount = useMemo(() => {
    return mergeUsageCount(state.usageCount, claudeUsageCount);
  }, [state.usageCount, claudeUsageCount]);

  const favoriteSkills = skills.filter(s => state.favorites.includes(s.id));

  // Deduplicate skills by id (same skill may exist in multiple locations)
  const uniqueSkills = useMemo(() => {
    const seen = new Set<string>();
    return skills.filter(s => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [skills]);

  // Deduplicate agents by id (same agent may exist in multiple locations)
  const uniqueAgents = useMemo(() => {
    const seen = new Set<string>();
    return agents.filter(a => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }, [agents]);

  // Create an array with usage counts for charts and ranking
  const skillsWithUsage = uniqueSkills.map(s => ({
    ...s,
    usage: lookupUsage(mergedUsageCount, s.id)
  }));

  const recentlyUsed = skillsWithUsage
    .filter(s => s.usage > 0)
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 3);

  // Top skills sorted by usage (for stats page)
  const topSkills = [...skillsWithUsage]
    .filter(s => s.usage > 0)
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 3);

  // Recently used skills based on recent array (for stats page - recently used list)
  const recentlyUsedSkills = useMemo(() => {
    return claudeRecent
      .slice(0, 5)
      .map(name => {
        // claudeRecent contains pure skill names (e.g., "brainstorming")
        // Find matching skill by extracting name from scanner ID
        return skillsWithUsage.find(s => extractSkillName(s.id) === name);
      })
      .filter((s): s is typeof skillsWithUsage[0] => s !== undefined);
  }, [claudeRecent, skillsWithUsage]);

  // Total usage count across all skills
  const totalUsageCount = Object.values(mergedUsageCount).reduce((acc, curr) => acc + curr, 0);

  return {
    state,
    skills: uniqueSkills,  // 使用去重后的数据，避免 React key 重复警告
    agents: uniqueAgents,  // 使用去重后的数据，避免 React key 重复警告
    commands,
    isLoading,
    toggleFavorite,
    recordUsage,
    completeOnboarding,
    toggleHook,
    favoriteSkills,
    recentlyUsed,
    topSkills,
    recentlyUsedSkills,
    skillsWithUsage,
    totalUsageCount,
    mergedUsageCount,
    claudeUsageCount,
  };
};
