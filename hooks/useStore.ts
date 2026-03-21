'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Skill, Agent, Command } from '../lib/types';
import { loadClaudeUsageData, mergeUsageCount } from '../lib/claude-usage';

export interface AppState {
  favorites: string[]; // Skill IDs
  usageCount: Record<string, number>; // Skill ID -> count (local only)
  hasSeenOnboarding: boolean;
}

const STORAGE_KEY = 'claude-code-feature-menu-v1';

const getInitialState = (): AppState => {
  if (typeof window === 'undefined') {
    return { favorites: [], usageCount: {}, hasSeenOnboarding: false };
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse state', e);
    }
  }
  return { favorites: [], usageCount: {}, hasSeenOnboarding: false };
};

export const useStore = () => {
  const [state, setState] = useState<AppState>(getInitialState);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claudeUsageCount, setClaudeUsageCount] = useState<Record<string, number>>({});

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

  // Derived state - merge local and Claude Code usage counts
  const mergedUsageCount = useMemo(() => {
    return mergeUsageCount(state.usageCount, claudeUsageCount);
  }, [state.usageCount, claudeUsageCount]);

  const favoriteSkills = skills.filter(s => state.favorites.includes(s.id));
  const recentlyUsed = skills
    .filter(s => mergedUsageCount[s.id] > 0)
    .sort((a, b) => (mergedUsageCount[b.id] || 0) - (mergedUsageCount[a.id] || 0))
    .slice(0, 5);

  return {
    state,
    skills,
    agents,
    commands,
    isLoading,
    toggleFavorite,
    recordUsage,
    completeOnboarding,
    favoriteSkills,
    recentlyUsed,
    mergedUsageCount,
    claudeUsageCount,
  };
};
