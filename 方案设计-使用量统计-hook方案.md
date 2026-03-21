# Feature Menu 使用量统计方案 - Hook 方案

> 创建时间：2026-03-21
> 更新时间：2026-03-21
> 状态：设计阶段
> 目标：实现真实的技能使用量统计（基于 Claude Code 实际调用 Skill 工具）

---

## 背景问题

**核心问题**：如何统计用户在 Claude Code 中真实使用技能的情况？

### 原有理解的误区

最初方案使用 `UserPromptSubmit` Hook，期望通过匹配用户输入的 `/skill-name` 命令来统计。但经过深入研究后发现：

| Hook | 触发条件 | 能捕获的内容 |
|------|----------|-------------|
| `UserPromptSubmit` | 用户提交 prompt | 仅用户手动输入的命令 |
| `InstructionsLoaded` | CLAUDE.md 或 rules 文件加载 | 不是 Skill 文件，无效 |
| **`PostToolUse`** | 工具调用成功后 | **所有 Skill 调用（包括自动触发）** |

**结论**：`UserPromptSubmit` 无法捕获 Claude Code 内部自动激活技能的情况，必须使用 `PostToolUse` Hook。

---

## 技术原理

### Skill 的激活机制

Claude Code 中，当技能被使用时，内部会调用 **`Skill` 工具**：

```json
// 手动输入 /agent-reach 时
{"type": "tool_use", "name": "Skill", "input": {"skill": "agent-reach", "args": "..."}}

// 自动加载 brainstorming 时
{"type": "tool_use", "name": "Skill", "input": {"skill": "superpowers:brainstorming"}}
```

**关键发现**：
- `PostToolUse` Hook 在 Skill 工具**执行成功后**触发
- 不区分是用户手动输入还是 Claude Code 自动激活
- 通过 `matcher: "Skill"` 可以精确匹配

### Skill ID 格式分析

| 调用格式 | 实际位置 | 统一 ID |
|----------|---------|---------|
| `agent-reach` | `~/.claude/skills/agent-reach/` | `agent-reach` |
| `superpowers:brainstorming` | `~/.claude/plugins/cache/.../brainstorming/` | `brainstorming` |

**处理规则**：取冒号 `:` 后面的部分作为 Skill ID。

---

## 实施方案

### 1. Shell Hook 脚本

**文件路径**：`~/.claude/hooks/log-skill-usage.sh`

```bash
#!/bin/bash
# 异步记录技能使用 - PostToolUse Hook (matcher: Skill)
# 此脚本在 Skill 工具调用成功后执行，不阻塞 Claude Code

read -r input

# 提取工具名称
tool_name=$(echo "$input" | jq -r '.tool_name // empty')

# 只处理 Skill 工具（matcher 已过滤，此处二次确认）
if [[ "$tool_name" != "Skill" ]]; then
  exit 0
fi

# 提取 skill 字段
# 格式: {"skill": "superpowers:brainstorming"} 或 {"skill": "agent-reach", "args": "..."}
skill=$(echo "$input" | jq -r '.tool_input.skill // empty')

if [[ -z "$skill" ]]; then
  exit 0
fi

# 统一处理：去掉命名空间前缀
# "superpowers:brainstorming" -> "brainstorming"
# "agent-reach" -> "agent-reach"
if [[ "$skill" == *:* ]]; then
  skill_id=$(echo "$skill" | awk -F':' '{print $NF}')
else
  skill_id="$skill"
fi

# Claude Code 根目录
CLAUDE_ROOT="${CLAUDE_CODE_ROOT:-$HOME/.claude}"
USAGE_FILE="$CLAUDE_ROOT/skills-usage.json"
TMP_FILE=$(mktemp)

# 读取或创建数据文件
if [[ -f "$USAGE_FILE" ]]; then
  jq --arg skill "$skill_id" '
    .version = 1 |
    .lastUpdated = now |
    .stats[$skill] = (.stats[$skill] // 0) + 1 |
    .lastSession = now |
    if (.recent | index($skill)) >= 0 then
      .recent = [($skill) + (.recent | del(.[0 | select(. == $skill)]))]
    else
      .recent = [($skill) + .recent[0:9]]
    end
  ' "$USAGE_FILE" > "$TMP_FILE"
else
  jq -n --arg skill "$skill_id" '{
    version: 1,
    lastUpdated: now,
    stats: {($skill): 1},
    recent: [$skill],
    lastSession: now
  }' > "$TMP_FILE"
fi

mv "$TMP_FILE" "$USAGE_FILE"
exit 0
```

**执行流程**：
1. 读取 Hook 输入的 JSON
2. 确认是 Skill 工具调用
3. 从 `tool_input.skill` 提取技能名称
4. 统一 ID 格式（去掉命名空间前缀）
5. 原子写入 `skills-usage.json`

### 2. Hook 配置

**文件路径**：`~/.claude/settings.json`

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Skill",
      "hooks": [{
        "type": "command",
        "command": ".claude/hooks/log-skill-usage.sh",
        "async": true
      }]
    }]
  }
}
```

**配置说明**：

| 字段 | 值 | 说明 |
|------|-----|------|
| `matcher` | `"Skill"` | 只在 Skill 工具调用时触发 |
| `type` | `"command"` | 执行外部 shell 脚本 |
| `command` | `".claude/hooks/log-skill-usage.sh"` | 相对于 `$HOME` |
| `async` | `true` | 后台异步执行，不阻塞 |

### 3. 数据文件格式

**文件路径**：`~/.claude/skills-usage.json`

```json
{
  "version": 1,
  "lastUpdated": 1742544000,
  "lastSession": 1742544000,
  "stats": {
    "brainstorming": 5,
    "agent-reach": 3,
    "code-review": 1
  },
  "recent": ["brainstorming", "agent-reach", "code-review"]
}
```

### 4. Feature Menu 数据读取模块

**文件路径**：`projects/feature-menu/lib/claude-usage.ts`（新建）

```typescript
import { promises as fs } from 'fs';
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
      require('fs').accessSync(skillsPath);
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
```

### 5. API 路由

**文件路径**：`projects/feature-menu/app/api/usage/route.ts`（新建）

```typescript
import { NextResponse } from 'next/server';
import { loadClaudeUsageData } from '../../../lib/claude-usage';

export async function GET() {
  const claudeUsage = await loadClaudeUsageData();
  return NextResponse.json({ stats: claudeUsage });
}
```

---

## 两个需求的关联说明

### 需求一：使用量统计（Hook 方案）

| 项目 | 说明 |
|------|------|
| 数据来源 | `PostToolUse` Hook 捕获 Skill 工具调用 |
| 触发时机 | Skill 工具执行成功后 |
| 统计范围 | 所有成功使用的技能（包括自动触发） |
| 数据文件 | `~/.claude/skills-usage.json` |

**与第二个需求完全解耦**：统计的是 Claude Code 内部真实发生的技能调用，与 Feature Menu 页面的操作无关。

### 需求二：复制提示（已确认）

**目标**：点击"去使用"按钮时，复制命令到剪贴板并提示用户。

**实现**（只需修改 `handleUseSkill` 函数）：

```typescript
const handleUseSkill = async (skill: Skill) => {
  await navigator.clipboard.writeText(skill.command);

  toast.success("已复制技能，去 Claude Code 中使用", {
    description: skill.command,
  });

  setSelectedSkill(null);
};
```

**与需求一的关联**：无直接关联。需求一统计的是真实使用情况，需求二只是提升用户体验。

---

## 性能考虑

| 指标 | 目标 | 说明 |
|------|------|------|
| Hook 执行时间 | < 50ms | 纯文件写入 |
| 异步模式 | 不阻塞 | `async: true` |
| 触发频率 | 每个 Skill 调用一次 | 实际使用才会触发 |
| Feature Menu 读取 | 启动/刷新时 | 可缓存，30s 轮询 |

---

## 隐私与安全

| 考虑点 | 说明 |
|--------|------|
| 数据位置 | `~/.claude/skills-usage.json`，用户可控 |
| 数据内容 | 仅 Skill ID 和计数，无敏感信息 |
| 传输 | 不离开用户机器 |
| 卸载 | 删除 hook 配置和文件即可 |

---

## 用户体验流程

```
┌─────────────────────────────────────────────────────────────┐
│  场景 1：用户在 Claude Code 中输入 /brainstorm             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ User submits prompt "/brainstorm"                     │  │
│  │ → Claude Code activates brainstorming skill           │  │
│  │ → Skill tool is called (PostToolUse fires)           │  │
│  │ → log-skill-usage.sh records: brainstorming +1       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  场景 2：Claude Code 自动激活技能                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Claude Code reasons and auto-loads agent-reach        │  │
│  │ → agent-reach skill tool is called                   │  │
│  │ → PostToolUse fires (matcher: Skill)                 │  │
│  │ → log-skill-usage.sh records: agent-reach +1          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  场景 3：用户在 Feature Menu 点击"去使用"                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ User clicks "去使用" button                            │  │
│  │ → Command copied to clipboard                         │  │
│  │ → Toast: "已复制技能，去 Claude Code 中使用"         │  │
│  │ → User switches to Claude Code, pastes command       │  │
│  │ → PostToolUse fires → usage recorded                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 后续步骤

| 步骤 | 操作 | 负责方 |
|------|------|--------|
| 1 | 创建 `~/.claude/hooks/` 目录 | 用户手动 |
| 2 | 创建 `log-skill-usage.sh` 脚本 | 用户手动 |
| 3 | 修改 `~/.claude/settings.json` 添加 Hook 配置 | 用户手动 |
| 4 | 创建 `lib/claude-usage.ts` 模块 | Feature Menu |
| 5 | 创建 `app/api/usage/route.ts` API | Feature Menu |
| 6 | 修改 `hooks/useStore.ts` 合并数据 | Feature Menu |
| 7 | 修改 `handleUseSkill` Toast 文案 | Feature Menu |
| 8 | 测试 Hook 是否正常工作 | 用户手动 |

---

## 相关文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `~/.claude/hooks/log-skill-usage.sh` | 新建 | Hook 脚本 |
| `~/.claude/settings.json` | 修改 | 添加 Hook 配置 |
| `projects/feature-menu/lib/claude-usage.ts` | 新建 | 数据读取模块 |
| `projects/feature-menu/app/api/usage/route.ts` | 新建 | API 路由 |
| `projects/feature-menu/hooks/useStore.ts` | 修改 | 合并统计数据 |
| `projects/feature-menu/app/pages/Skills.tsx` | 修改 | 更新 Toast 文案 |

---

## 备选方案对比

| 方案 | 能捕获手动 | 能捕获自动 | 可行性 |
|------|-----------|-----------|--------|
| `UserPromptSubmit` Hook | ✅ | ❌ | 可行但不完整 |
| `InstructionsLoaded` Hook | ❌ | ❌ | 不可行（不作用于 Skill） |
| **PostToolUse Hook (matcher: Skill)** | ✅ | ✅ | **最佳方案** |
| 扫描 session/transcript | 困难 | 困难 | 不可靠 |

---

## 参考资料

- [Claude Code Hooks 官方文档](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Feature Menu 项目](../projects/feature-menu/)
- [使用指南](./使用指南.md)
