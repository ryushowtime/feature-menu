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

  // Create an array with usage counts for charts and ranking
  const skillsWithUsage = uniqueSkills.map(s => ({
    ...s,
    usage: mergedUsageCount[s.id] || 0
  }));

  const recentlyUsed = uniqueSkills
    .filter(s => mergedUsageCount[s.id] > 0)
    .sort((a, b) => (mergedUsageCount[b.id] || 0) - (mergedUsageCount[a.id] || 0))
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
      .map(id => skillsWithUsage.find(s => s.id === id))
      .filter((s): s is typeof skillsWithUsage[0] => s !== undefined);
  }, [claudeRecent, skillsWithUsage]);

  // Total usage count across all skills
  const totalUsageCount = Object.values(mergedUsageCount).reduce((acc, curr) => acc + curr, 0);

  return {
    state,
    skills,
    agents,
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
