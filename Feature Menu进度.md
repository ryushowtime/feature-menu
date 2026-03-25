# Feature Menu 项目进度

最后更新：2026-03-26

## 当前版本

**v5.2** - Bug 修复与新功能版

## 最近提交 (已提交)

| 提交 | 描述 |
|------|------|
| `b67a2f8` | fix: 修复 Stats 页面 usage 数据不匹配问题 |
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

### 4. Stats 页面 usage 数据不匹配问题

**问题**：Hook 记录的 skill ID（如 `brainstorming`）与 Scanner 生成的 ID 格式（如 `brainstorming@skills-ecc/...`）不匹配，导致 usage 统计始终为 0

**根因**：
- Hook 写入 `skills-usage.json` 时使用纯 skill 名称作为 key
- Scanner 生成的 ID 格式为 `名称@相对路径`
- useStore 直接用 scanner ID 去匹配，导致永远找不到

**修复方案**：
- [hooks/useStore.ts](hooks/useStore.ts)
  - 新增 `extractSkillName()` 从 scanner ID 提取 skill 名称
  - 新增 `lookupUsage()` 支持两种 ID 格式查找
  - 修复 `skillsWithUsage` 使用匹配逻辑
  - 修复 `recentlyUsedSkills` 匹配逻辑

**结果**：Stats 页面正确显示总调用次数（15次）和最近使用列表

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

- [ ] 讨论迭代方向并确定下一个版本的核心功能
- [ ] 项目评价与迭代方向文档化（已完成）

## 项目评价与迭代方向（2026-03-26）

### 当前价值定位

**本质是一个「技能商店 + 使用仪表盘」**

| 解决的问题 | 价值 |
|-----------|------|
| 技能发现 | Claude Code 内置很多 Skill/Agent，但用户不知道它们存在 |
| 快速访问 | 统一的入口，不用记命令，点点鼠标就能用 |
| 使用反馈 | 知道自己在用什么、什么用得多 |
| 降低门槛 | 新用户可以通过浏览推荐来学习 |

### 迭代方向建议

#### 1. 智能推荐（当前已有雏形）
- 根据**项目代码特征**自动推荐相关 Skill
- 如检测到 `package.json` 就推荐 `npm` 相关 Skill
- 检测到 `*.py` 就推荐 Python 生态的 Skill

#### 2. 搜索增强
- 跨所有分类（Skills/Agents/Commands/Tools）统一搜索
- 支持**模糊搜索**和**拼音搜索**
- 搜索历史和热门搜索

#### 3. 使用数据分析
- **时间趋势图**：看自己这周 vs 上周的技能使用变化
- **技能对比**：同类 Skill 被使用的次数对比
- **团队视角**（如果有多人使用）：团队最常用的 Skill 是什么

#### 4. 技能详情页
- 点击 Skill 后能看到**使用教程**、**示例**、**最佳实践**
- 类似一个技能 Wiki

#### 5. 收藏夹增强
- 收藏夹分类（自定义文件夹）
- 分享收藏夹给其他用户
- 导入/导出配置

#### 6. 一键安装第三方 Skill
- 连接外部 Skill 市场
- 点一下就安装新 Skill 到本地

### 核心演进方向

**从「浏览工具」进化成「智能助手」**

- 短期（v6.x）：搜索增强 + 详情页
- 中期（v7.x）：智能推荐 + 时间趋势
- 长期（v8.x）：技能市场 + 团队协作
