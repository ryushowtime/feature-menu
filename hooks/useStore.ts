'use client';

import { useState, useEffect, useCallback } from 'react';
import { Skill, Agent, Command } from '../lib/types';

export interface AppState {
  favorites: string[]; // Skill IDs
  usageCount: Record<string, number>; // Skill ID -> count
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

  // Derived state
  const favoriteSkills = skills.filter(s => state.favorites.includes(s.id));
  const recentlyUsed = skills
    .filter(s => state.usageCount[s.id] > 0)
    .sort((a, b) => (state.usageCount[b.id] || 0) - (state.usageCount[a.id] || 0))
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
  };
};
