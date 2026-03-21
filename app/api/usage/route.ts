import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import path from 'path';
import os from 'os';

interface ClaudeUsageData {
  version: number;
  lastUpdated: number;
  lastSession: number;
  stats: Record<string, number>;
  recent: string[];
}

function getClaudeCodeRoot(): string {
  if (process.env.CLAUDE_CODE_ROOT) {
    return process.env.CLAUDE_CODE_ROOT;
  }
  const homeDir = os.homedir();
  const commonPaths = [
    path.join(homeDir, 'everything-claude-code'),
    path.join(homeDir, '.claude'),
    path.join(homeDir, 'Claude Code'),
    path.join(homeDir, 'claude-code'),
  ];
  for (const p of commonPaths) {
    try {
      const skillsPath = path.join(p, 'skills');
      fsSync.accessSync(skillsPath);
      return p;
    } catch { /* continue */ }
  }
  return path.join(process.cwd(), '../..');
}

async function loadClaudeUsageData(): Promise<Record<string, number>> {
  const claudeRoot = getClaudeCodeRoot();
  const usageFile = path.join(claudeRoot, 'skills-usage.json');
  try {
    const content = await fs.readFile(usageFile, 'utf-8');
    const data: ClaudeUsageData = JSON.parse(content);
    return data.stats || {};
  } catch {
    return {};
  }
}

export async function GET() {
  try {
    const claudeUsage = await loadClaudeUsageData();
    return NextResponse.json({ stats: claudeUsage });
  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data', stats: {} },
      { status: 500 }
    );
  }
}
