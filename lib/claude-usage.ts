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

// 动态获取 Claude Code 根目录
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

// 从 Claude Code 的 skills-usage.json 读取使用数据
export async function loadClaudeUsageData(): Promise<Record<string, number>> {
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

// 合并本地 localStorage 统计和 Claude Code 统计
export function mergeUsageCount(
  local: Record<string, number>,
  claude: Record<string, number>
): Record<string, number> {
  const merged = { ...local };
  for (const [skillId, count] of Object.entries(claude)) {
    merged[skillId] = (merged[skillId] || 0) + count;
  }
  return merged;
}
