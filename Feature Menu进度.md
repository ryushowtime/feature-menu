# Feature Menu 项目进度

最后更新：2026-03-26

## 当前版本

**v5.2** - Bug 修复与新功能版

## 最近提交 (已提交)

| 提交 | 描述 |
|------|------|
| `db0c12b` | fix: Skill 接口添加 usage 可选属性修复类型错误 |
| `c4b3aff` | docs: 修正最近使用描述，恢复原有表述 |
| `ae520d7` | docs: 更新 Feature Menu 说明文档 |
| `670ff50` | feat(feature-menu): 将 Stats 排行榜改为最近使用列表 |
| `bd3c60f` | docs: 更新 Feature Menu 文档（Top 3、CI 配置、技术栈） |
| `f8e92fe` | fix: 修复 SKILL.md 中裸 URL 的 markdownlint 错误 |
| `b35d0bf` | docs: 更新 Feature Menu 项目说明，添加 Stats 页面和 ClientOnly 组件 |
| `5a31add` | fix: 统一 Stats 页面 Top N 显示限制 |
| `593300a` | feat: 添加使用量统计 Hook 功能 |
| `6b0aaf7` | docs: 添加 Figma 设计提示词和需求文档 |

## 2026-03-26 修复内容

### 1. React key 重复警告修复

**问题**：控制台大量 `Warning: Encountered two children with the same key` 警告（/skills、/agents 页面）

**根因**：scanner 扫描时同一 skill/agent 在不同 root 目录下被重复扫描，导致 ID 重复

**修复方案**：
- [hooks/useStore.ts](hooks/useStore.ts)
  - `skills` 返回改为 `uniqueSkills`（已存在但未使用）
  - 添加 `uniqueAgents` 去重逻辑
- [app/pages/Agents.tsx](app/pages/Agents.tsx)
  - Badge key 改为 `${agent.id}-${tool}` 避免 index 重复

**结果**：控制台错误从 161 降至 0

### 2. /tools 页面 404 修复

**问题**：导航中有"工具"入口，但页面不存在

**修复方案**：
- 新增 [app/pages/Tools.tsx](app/pages/Tools.tsx) - 工具页面组件
- 新增 [app/tools/page.tsx](app/tools/page.tsx) - 路由页面

### 3. Scanner ID 生成逻辑修复（根源修复）

**问题**：scanner 用 `dirName`/`fileName` 作为 ID，同一 skill/agent 在不同 root 下产生相同 ID

**修复方案**：
- [lib/scanner.ts](lib/scanner.ts)
  - Skills: 使用 `${dirName}@${relativePath}` 生成唯一 ID
  - Agents: 使用 `${baseId}@${agentPath}` 生成唯一 ID

**结果**：Skills 194→194（0 重复），Agents 52→52（0 重复）

## 待处理

- [x] 提交未提交的变更
- [x] 测试 Hook 状态切换功能
- [x] 验证 Stats 页面数据展示

## 功能列表

- [x] 技能浏览（Skills）
- [x] 代理浏览（Agents）
- [x] 命令浏览（Commands）
- [x] 工具浏览（Tools） - 新增
- [x] 分类筛选
- [x] 关键词搜索
- [x] 任务推荐
- [x] 收藏功能
- [x] 最近使用
- [x] 文件扫描
- [x] 命令复制
- [x] 技能详情弹窗
- [x] 新手引导
- [x] 键盘快捷键
- [x] PostToolUse Hook 使用量统计
- [x] Stats 页面（Top 3 + 最近使用列表）
- [x] 一键安装 Hook

## 技术栈

- **框架**：Next.js 14 (React) - App Router
- **样式**：Tailwind CSS v3 (Cyberpunk 科技风格)
- **图标**：Lucide React
- **图表**：Recharts
- **状态管理**：localStorage + React Context
- **类型**：TypeScript
