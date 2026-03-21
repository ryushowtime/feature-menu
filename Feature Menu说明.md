# Feature Menu 项目说明

## 项目简介

**Feature Menu - Claude Code 功能中心**

一键浏览和管理用户所有已安装的 Claude Code 技能、代理和命令。

---

## 版本历史

### v1.0 - Skill 版本（效果不好，未采用）

最初的版本尝试用 Claude Code Skill 实现，但效果不理想，未继续使用。

### v2.0 - 第一版 Figma 设计（不满意）

编写了详细的设计提示词发给 Figma，但因为约束条件过多，设计效果未达预期。

### v3.0 - 第二版 Figma 设计（英文版，基础版本）

重新编写提示词去掉了过多限制，Figma 设计效果明显提升。

**设计文件**：
- `Figma-设计提示词.md` - 第二版提示词
- `PR.md` - 需求文档（**最新版设计规范**）
- `docs/presentation.html` - Figma 导出的演示稿

**技术栈**：React + Vite + Tailwind CSS v4 → 已转换为 Next.js 14

### v4.0 - 中文 UI 版（当前版本）

将英文版 UI 全部翻译为中文，并优化了多项功能。

### v5.0 - 使用量统计 Hook（新增功能）

新增真实使用量统计功能，通过 Claude Code Hook 捕获技能调用。

**核心功能**：
- 使用 `PostToolUse` Hook 捕获 Claude Code 中所有技能调用（包括自动触发）
- 统计数据存储在 `~/.claude/skills-usage.json`
- 与 Feature Menu 本地统计合并显示
- 支持一键安装

---

## 开发工作目录

**路径**：`projects/feature-menu/`

这是项目的**主开发目录**，所有开发工作都在这里进行。

---

## 代码同步流程

```
1. 在 projects/feature-menu/ 进行开发
2. 开发完成后，同步到 ~/feature-menu/
3. 在 ~/feature-menu/ 提交并推送到 GitHub
```

**具体命令**：
```bash
# 同步代码（从开发目录到推送目录）
cp -r projects/feature-menu/* ~/feature-menu/

# 提交到 GitHub
cd ~/feature-menu
git add -A
git commit -m "描述改动"
git push
```

---

## GitHub 仓库

**地址**：https://github.com/ryushowtime/feature-menu

**本地推送目录**：`~/feature-menu/`

---

## 功能列表

- **技能浏览** - 查看所有已安装的技能、代理和命令
- **分类筛选** - 按类别快速找到需要的工具
- **搜索功能** - 关键词搜索，瞬间定位（按 `/` 聚焦）
- **任务推荐** - 告诉它你想做什么，它推荐合适的技能
- **收藏功能** - 收藏常用技能，方便快速访问
- **最近使用** - 快速访问最近使用过的技能
- **文件扫描** - 自动检测 Claude Code 目录（支持多路径）
- **命令复制** - 点击即复制命令到剪贴板
- **技能详情** - 弹窗显示技能完整信息
- **新手引导** - 首次使用介绍
- **键盘快捷键** - 按 `/` 聚焦搜索框
- **真实使用量统计** - 通过 Hook 捕获 Claude Code 中真实技能调用
- **一键安装 Hook** - 自动化配置 Claude Code Hook

---

## 用户触发场景与流程

### 触发场景

用户在以下场景下可以使用 Feature Menu：

| 触发方式 | 示例 |
|---------|------|
| 显式打开 | "打开功能中心"、"feature menu"、"功能菜单" |
| 浏览意图 | 想浏览已安装的技能、代理或命令 |
| 详情查询 | 想查看技能的使用场景和触发方式 |
| 收藏搜索 | 想收藏或搜索技能 |
| 询问有什么 | "有什么 skill"、"有什么命令"、"有什么 agent"、"有哪些技能" |
| 想要使用 | "想用技能"、"要用命令"、"想用代理" |
| 请求推荐 | "推荐个技能"、"有什么好用的技能" |
| 了解功能 | 表达想了解或使用 Claude Code 的技能、命令、代理功能 |

### 完整使用流程

当用户触发 Feature Menu 后，执行以下步骤：

**步骤 1：通知用户**
```
检测到你想要使用技能、命令或代理，正在打开功能中心...
```

**步骤 2：启动服务**
- 检查是否已安装（检查 ~/feature-menu 目录）
- 如已安装：直接启动服务 `cd ~/feature-menu && npm run dev &`
- 如未安装：先安装依赖再启动 `cd ~/feature-menu && npm install && npm run dev &`
- 使用 `&` 让服务在后台运行

**步骤 3：等待服务就绪**
- 等待 3-5 秒让服务启动完成

**步骤 4：自动打开浏览器**
- macOS: `open http://localhost:3000`
- Linux: `xdg-open http://localhost:3000`
- Windows: `start http://localhost:3000`

**步骤 5：确认启动成功**
```
✅ 功能中心已打开！
📍 访问 http://localhost:3000 查看所有技能、代理和命令
按 Ctrl+C 停止服务
```

### 新手引导流程

首次使用 Feature Menu 时，用户会看到新手引导（Onboarding）：

1. **欢迎页** - 产品定位介绍
2. **功能概览** - 展示技能/代理/命令三大功能
3. **任务推荐介绍** - 说明"告诉我你想做什么"
4. **开始使用** - 引导进入主界面

用户可选择"不再显示"跳过后续引导。

---

## 技术实现

- **框架**：Next.js 14 (React) - App Router
- **样式**：Tailwind CSS v3 (Cyberpunk 科技风格)
- **图标**：Lucide React
- **状态管理**：localStorage（收藏、使用记录）
- **架构**：本地独立应用，服务端通过 API 路由读取本地文件系统

---

## 项目文件结构

```
feature-menu/
├── app/
│   ├── layout.tsx           # 根布局
│   ├── page.tsx            # 首页 (Dashboard)
│   ├── globals.css          # 全局样式
│   ├── AppShell.tsx        # 侧边栏布局
│   ├── Onboarding.tsx      # 新手引导
│   ├── skills/page.tsx     # 技能页面路由
│   ├── agents/page.tsx     # 代理页面路由
│   ├── commands/page.tsx   # 命令页面路由
│   ├── task-wizard/page.tsx # 任务向导路由
│   ├── help/page.tsx       # 帮助页面路由
│   ├── pages/              # 页面组件
│   │   ├── Dashboard.tsx
│   │   ├── Skills.tsx
│   │   ├── Agents.tsx
│   │   ├── Commands.tsx
│   │   ├── TaskWizard.tsx
│   │   └── Help.tsx
│   └── api/
│       ├── scan/route.ts   # 扫描 API
│       └── usage/route.ts  # 使用量统计 API
├── components/ui/
│   ├── index.tsx           # 基础组件（Button, Card, Badge, Input）
│   └── Modal.tsx            # 弹窗组件
├── hooks/
│   └── useStore.ts         # 状态管理（收藏、最近使用、合并统计）
├── lib/
│   ├── scanner.ts          # 文件扫描器
│   ├── types.ts            # 类型定义
│   ├── recommend.ts        # 推荐算法
│   ├── usage.ts            # 使用统计（本地）
│   └── claude-usage.ts    # Claude Code 使用统计读取
├── install/
│   ├── log-skill-usage.sh # Claude Code Hook 脚本
│   ├── install-hook.ts     # 一键安装脚本
│   └── README.md           # 安装说明
├── bin/
│   └── feature-menu.js     # CLI 入口脚本
├── docs/
│   └── presentation.html   # Figma 演示文件
├── start.sh                # macOS/Linux 启动脚本
├── start.bat               # Windows 启动脚本
├── SKILL.md                # Claude Code 技能文件
├── README.md               # 中文说明
├── README_EN.md            # 英文说明
├── 使用指南.md              # 详细使用指南
├── PR.md                   # 需求文档（最新版设计规范）
├── Figma-设计提示词.md       # 第二版设计提示词
└── package.json
```

---

## 文档说明

| 文档 | 说明 |
|------|------|
| [README.md](README.md) | 项目简介、安装方式、快速开始 |
| [使用指南.md](使用指南.md) | 详细使用说明，包含功能介绍、界面解读、故障排除 |
| [PR.md](PR.md) | 需求文档，**最新版设计规范** |
| [Figma-设计提示词.md](Figma-设计提示词.md) | 第二版 Figma 设计提示词 |
| [SKILL.md](SKILL.md) | Claude Code 技能文件 |

---

## 启动方式

```bash
cd ~/feature-menu  # 或 projects/feature-menu
npm install
npm run dev
```

**一键启动脚本**：`./start.sh`（macOS/Linux）或 `start.bat`（Windows）

---

## 与 ECC 主项目的关系

**ECC 目录**：`~/everything-claude-code/`

ECC 是一个集合了多个工具的主项目，projects/feature-menu/ 只是其中存放项目代码的文件夹。**两者 git 相互独立**，ECC 只做本地备份，不推送到 GitHub。

---

## 使用量统计功能

### 功能原理

通过 Claude Code 的 `PostToolUse` Hook 捕获所有技能调用：

1. 用户在 Claude Code 中使用技能（如 `/brainstorm` 或自动触发）
2. Claude Code 调用 `Skill` 工具
3. Hook 触发 `log-skill-usage.sh` 脚本
4. 脚本将使用记录写入 `~/.claude/skills-usage.json`
5. Feature Menu 读取并合并显示

### 安装方式

**自动安装**：在 Feature Menu 页面点击「启用使用统计」按钮

**手动安装**：
```bash
# 1. 安装 jq（如果没有）
brew install jq  # macOS

# 2. 运行安装脚本
npx ts-node install/install-hook.ts
```

### 技术细节

- **Hook 类型**：`PostToolUse` + `matcher: "Skill"`
- **数据文件**：`~/.claude/skills-usage.json`
- **安装位置**：`~/.claude/hooks/log-skill-usage.sh`
- **API 端点**：`/api/usage`
- **轮询间隔**：30 秒

### 数据格式

```json
{
  "version": 1,
  "lastUpdated": 1742544000,
  "lastSession": 1742544000,
  "stats": {
    "brainstorming": 5,
    "agent-reach": 3
  },
  "recent": ["brainstorming", "agent-reach"]
}
```
