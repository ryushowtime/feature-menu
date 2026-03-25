# Feature Menu 项目说明

## 项目简介

**Feature Menu - Claude Code 功能中心**

一键浏览和管理用户所有已安装的 Claude Code 技能、代理和命令。

---

## 架构概述

```
用户浏览器 → Next.js App (客户端)
    ↓ fetch
┌─────────────────────────────────────────────┐
│  /api/scan   →  lib/scanner.ts            │  扫描本地 Skill/Agent/Command 文件
│  /api/usage  →  ~/.claude/skills-usage.json │  获取 Hook 记录的使用数据
└─────────────────────────────────────────────┘
    ↓
hooks/useStore.ts  (状态管理 + 数据合并)
    ↓
React 组件渲染 (Skills/Agents/Commands/Stats 页面)
```

**关键文件职责**：

| 文件 | 职责 |
|------|------|
| `lib/scanner.ts` | 扫描本地文件系统，生成 Skill/Agent/Command 数据 |
| `hooks/useStore.ts` | 状态管理，合并本地+Hook 数据，提供收藏/最近使用 |
| `lib/recommend.ts` | 任务推荐算法 |
| `install/log-skill-usage.sh` | Hook 脚本，Skill 使用时自动写入 `skills-usage.json` |
| `app/api/scan/route.ts` | 扫描 API |
| `app/api/usage/route.ts` | 使用量 API |

---

## 版本历史

| 版本 | 描述 |
|------|------|
| v1.0 | Skill 版本，效果不好未采用 |
| v2.0 | 第一版 Figma 设计，不满意 |
| v3.0 | 第二版 Figma 设计（英文基础版） |
| v4.0 | 中文 UI 版（当前版本基础） |
| v5.0 | 使用量统计 Hook 功能 |

**设计文件**：`PR.md`（需求文档）、`Figma-设计提示词.md`

---

## 开发工作目录

**路径**：`projects/feature-menu/`（主开发目录）

**同步流程**：
```
1. projects/feature-menu/ 进行开发
2. cp -r projects/feature-menu/* ~/feature-menu/
3. cd ~/feature-menu && git push
```

**GitHub**：`https://github.com/ryushowtime/feature-menu`

---

## 功能列表

- 技能/代理/命令浏览、分类筛选、关键词搜索（按 `/` 聚焦）
- 任务推荐、收藏功能、最近使用
- 文件扫描、命令复制、技能详情弹窗、新手引导
- 使用量统计（Hook）、一键安装 Hook

---

## 技术栈

- **框架**：Next.js 14 (React) - App Router
- **样式**：Tailwind CSS v3 (Cyberpunk 科技风格)
- **图表**：Recharts
- **状态管理**：localStorage + React Context

---

## 开发规范

### 1. 客户端组件限制 ⚠️

`'use client'` 组件**不能**导入使用 Node.js 模块（`fs`, `path`, `os` 等）的文件。

```typescript
// ❌ 错误 - 客户端组件导入了使用 fs 的模块
import { xxx } from '../lib/claude-usage';  // 使用了 fs！

// ✅ 正确 - 纯函数保留在客户端组件本地定义
function mergeUsageCount(local, claude) { ... }
```

### 2. TypeScript 类型定义 ⚠️

安装 JS npm 包时需同时安装 `@types/` 包，否则 CI 构建可能失败。

```bash
npm install --save-dev @types/js-yaml
```

### 3. 并行处理优先

独立操作用 `Promise.all()` 并行，而非 for...of 串行。

### 4. 数据格式一致性 ⚠️

多数据源合并时需确保 key 格式一致，避免直接用 `id` 或 `name` 盲目匹配。

```typescript
// Hook 数据: { "brainstorming": 3 }
// Scanner ID: "brainstorming@skills-ecc/..."
// 需提取名称后再匹配
function extractSkillName(scannerId: string): string {
  const atIndex = scannerId.indexOf('@');
  return atIndex > 0 ? scannerId.substring(0, atIndex) : scannerId;
}
```

### 5. AI 代理结果需验证

代理（code review、simplify）的建议只是参考，需人工验证后再修改。

---

## 项目文件结构

```
feature-menu/
├── app/
│   ├── pages/          # 页面组件（Dashboard, Skills, Agents, Commands, Stats 等）
│   ├── api/            # API 路由（scan, usage）
│   ├── skills/, agents/, commands/, stats/  # 路由页面
├── components/ui/      # 基础组件（Button, Card, Badge, Input, Modal）
├── hooks/useStore.ts  # 状态管理
├── lib/
│   ├── scanner.ts      # 文件扫描器
│   ├── types.ts       # 类型定义
│   ├── recommend.ts    # 推荐算法
├── install/
│   ├── log-skill-usage.sh  # Hook 脚本
│   └── install-hook.ts      # 安装脚本
```

---

## 启动方式

```bash
cd ~/feature-menu && npm install && npm run dev
```

---

## 使用量统计

通过 `PostToolUse` Hook 捕获技能调用，记录到 `~/.claude/skills-usage.json`。

- **安装**：`npx ts-node install/install-hook.ts`（需先安装 `jq`）
- **API**：`/api/usage` 返回 `stats` 和 `recent`
- **轮询**：30 秒

---

## 与 ECC 主项目的关系

`~/everything-claude-code/` 是本地备份，**两者 git 相互独立**。projects/feature-menu/ 只做代码存放。
