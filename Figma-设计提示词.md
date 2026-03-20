# Feature Menu - Figma 设计提示词

## 产品概述

**产品名称**: Feature Menu - 功能中心
**产品类型**: Claude Code 插件管理工具（Web 应用）
**目标用户**: 所有 Claude Code 用户，包括技术新手
**核心功能**: 浏览、管理已安装的技能（Skills）、代理（Agents）和命令（Commands）

**设计理念**: 功能全面但不复杂，新手也能轻松上手

---

## 整体风格

**风格**: 科技感 / Cyberpunk
**主题**: 深色主题为主

### 视觉特征
- 深色背景 + 霓虹发光效果
- 几何线条装饰：Header 底部 1px 渐变线条（#71c4ef → #a855f7）；卡片悬浮时边框渐变发光
- 现代感字体（Inter）
- 微妙的渐变边框（卡片边框从左到右渐变：#71c4ef → #a855f7）

---

## 页面结构

### 1. 整体框架
- 固定 Header（顶部导航栏，含 Tab 切换：Dashboard / Skills / Agents / Commands）
- 左侧侧边栏（分类导航，**仅在 Skills/Agents/Commands 页面显示**，Dashboard 页面不显示）
- 主内容区域（内容随 Tab 切换变化）
- 默认深色主题
- 桌面端固定布局（最小宽度 1024px，不做响应式）
- **布局实现方式**：主内容区使用 CSS Flexbox，Header 固定定位（position: fixed，z-index: 40）；Dashboard 页面主内容区 `margin-left: 0`（无侧边栏）；Skills/Agents/Commands 页面主内容区 `margin-left: 220px`（左侧留出侧边栏空间）

### 2. 首页 Dashboard
- 数据统计卡片（3 张 StatsCard：Skills 总数、Agents 总数、Commands 总数）
  - **不使用"使用趋势"图表**，卡片只显示数量数字 + 对应分类图标
- 快捷操作入口（2 张 QuickActionCard：Task 推荐、Help 帮助）
- 最近使用技能列表（RecentDropdown **默认展开**显示在 Dashboard 中，最多 5 条，每条显示名称 + 图标 + 使用次数）；Header 中的 RecentDropdown 为收起状态（点击才展开）
- 收藏夹快捷入口（点击跳转至 Skills 页面并筛选收藏）
- **注意**：Dashboard 页面不显示左侧分类侧边栏

### 3. Skills 浏览页面
- 顶部：搜索栏（宽度占满） + 筛选/排序控件（右侧对齐）
- 左侧：分类侧边栏（宽度固定 220px，带滑动指示器，固定显示）
- 中间：技能卡片网格
  - 布局：CSS Grid，`grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`
  - 间距：卡片间距 20px（gap: 20px）
  - 卡片最小宽度：240px，最大不超过 1fr（填满可用空间）
  - 注：最小宽度 1024px - 侧边栏 220px = 内容区 804px，240px 最小宽度确保一行最多可排 3 列（240×3=720px）
  - 卡片内边距：24px（上下左右均为 24px）
  - 卡片高度：不固定，根据内容自适应
  - 可滚动区域：中间网格区域可独立滚动（overflow-y: auto）
- 右侧：无详情预览面板（点击卡片后通过 SkillDetail 弹窗查看详情）

### 4. Agents / Commands 浏览页
- 与 Skills 浏览页完全一致布局（顶部搜索栏 + 左侧分类侧边栏 + 中间卡片网格）

### 5. 弹窗（共 4 个，均可通过点击背景遮罩层或 ESC 键关闭）
| 弹窗 | 用途 | 尺寸 |
|------|------|------|
| Onboarding | 新手引导（首次使用，4 步，可跳过） | 最大宽度 500px，高度 400px（固定高度，内容区不滚动） |
| SkillDetail | 技能详情查看，包含图标、名称、分类、难度 | 最大宽度 600px；弹窗总高度由内容撑开，内容区最大高度 70vh（超出可滚动），**但最小高度不低于 300px**；弹窗自身有固定标题栏（含关闭按钮）和固定底部操作栏 |
| TaskWizard | 任务推荐向导（2 步），Step 1: 选择任务类型；Step 2: 查看推荐技能 | 最大宽度 700px；弹窗总高度由内容撑开，内容区最大高度 70vh（超出可滚动），**但最小高度不低于 300px**；弹窗自身有固定标题栏（含"任务推荐"标题和关闭按钮）和固定底部操作栏 |
| Help | 帮助弹窗（Glossary + FAQ，Tab 切换） | 最大宽度 700px；弹窗总高度由内容撑开，内容区最大高度 70vh（超出可滚动），**但最小高度不低于 300px**；Tab 切换在内容区内部实现；弹窗自身有固定标题栏（含"帮助"标题和关闭按钮）；**无**固定底部操作栏 |

**注意**：
- Onboarding 仅首次使用显示（localStorage 记录是否已完成）
- 核心弹窗为后 3 个（SkillDetail、TaskWizard、Help）

---

## 功能详情

### 搜索与筛选
- 搜索框：聚焦时发光，显示预设热门搜索词下拉列表
  - 预设词（硬编码，共 8 个）：React、测试、部署、数据库、安全、API、CI/CD、Python
  - 交互：点击预设词 → 关键词填充到输入框并执行搜索；按 Enter → 执行当前输入搜索；按 Esc → 清空搜索并关闭建议
  - **防抖逻辑**：用户输入时延迟 300ms 再执行搜索（使用 debounce），避免每次击键都触发过滤
- 筛选标签：可移除的芯片样式（如 [开发框架 ×]），显示在搜索栏下方 8px 处；右侧有"清除全部"链接（仅在有筛选时显示）；点击"×"移除单个筛选，点击"清除全部"移除所有筛选
- 排序选项：下拉选择器，选项为"名称（升序）/ 名称（降序）/ 使用次数 / 添加时间 / 难度"

### 卡片设计
- 圆角卡片（12-16px），深色背景 #1a1a2e
- 边框：1px 渐变边框（从左到右：#71c4ef → #a855f7）
- **悬浮效果**：发光边框（#71c4ef glow）+ scale(1.02) + 阴影扩散
  - **注意**：悬浮时**不要**显示任何文字提示（如"点击查看详情"等），只保留视觉特效
- 收藏按钮带弹跳动画
- 底部标签：显示分类名称 + 难度等级（初级/中级/高级，中文显示）
- 技能卡片内容：图标、名称、描述摘要（最多 2 行，超出省略）、收藏按钮

### 新手引导
- Onboarding 引导（首次使用，4 步，可跳过）
  - Step 1: 欢迎语 + 产品定位介绍（文字描述）
  - Step 2: 功能概览（**水平居中排列 3 个功能块**：技能/代理/命令，每个功能块包含图标 + 下方文字标签；图标尺寸约 56px，功能块之间间距 32px）
  - Step 3: Task 推荐介绍（文字说明"告诉我你想做什么"）
  - Step 4: 完成，开始使用（仅含"开始使用"按钮）
  - 交互：底部有"跳过"按钮；最后一步不显示"跳过"和"下一步"
- 工具提示（Tooltips）：悬浮 300ms 后显示；内容：收藏按钮（"收藏"/"取消收藏"）、命令卡片（"点击复制"）；样式：深色背景 #1a1a2e，白色文字 12px，圆角 6px，padding 6px 10px
- 空状态引导文案

### 反馈系统
- Toast 通知（右下角，2-3 秒自动消失）
  - 收藏成功："已添加到收藏夹"
  - 取消收藏："已从收藏夹移除"
  - 复制命令："已复制命令到剪贴板"
  - 技能使用次数 +1："已记录使用"
  - 操作失败："操作失败，请重试"
- Toast 样式：深色背景（#1a1a2e），白色文字，青色左边框（#71c4ef，2px）
- Toast 排列：右下角堆叠，垂直间距 8px；最多同时显示 3 个
- **队列逻辑**：第 4 个 Toast 进入队列等待，当前一个消失后队列首个 Toast 才显示；每个 Toast 固定显示 2.5s（接近 3s 但更精确）

### 键盘支持
- `/` 键：聚焦搜索框（界面上不需要显示提示）
- `Esc` 键：关闭弹窗
- **完整键盘导航**（SearchBar 下拉、SortDropdown、FilterChips）：
  - `ArrowDown` / `ArrowUp`：在下拉选项间移动
  - `Enter`：选中当前选项
  - `Esc`：关闭下拉但不执行搜索
- **弹窗焦点管理**：
  - 打开弹窗时：焦点移到弹窗内部（标题栏或第一个可交互元素）
  - 关闭弹窗时：焦点恢复到打开弹窗前所在的元素（如触发按钮）
  - 弹窗 DOM 写在遮罩层之后，使用 `aria-modal="true"` 正确隔离

### 弹窗交互细节
- SkillDetail：
  - 内容结构：图标 + 名称 + 分类标签 + 难度等级 | 描述 | 使用场景（When to Use）| 触发命令（代码格式，JetBrains Mono）
  - 底部按钮：收藏按钮（左侧）+ "开始使用"按钮（右侧，青色填充按钮）
  - "开始使用"按钮交互：点击 → 关闭弹窗 → 记录使用次数 +1 → 显示 Toast"已记录使用"
- TaskWizard：
  - Step 1：网格按钮选择任务类型（固定 8 个选项：编写代码、测试、代码审查、部署、数据库、安全、API、文档）
  - Step 2：根据选择显示推荐技能列表（以 SkillCard 展示，最多 3-5 个）
  - 底部："上一步"按钮（仅 Step 2 显示）+ "重新选择"按钮
- Help：
  - Tab 切换：Glossary / FAQ 两个标签页
  - Glossary 内容（硬编码，共约 10 个术语，按首字母排序 A-Z）：Skill、Agent、Command、Hook、MCP、TDD、E2E Testing、CI/CD、API Design、Security Review 等
  - FAQ 内容（硬编码，共 5 个 Q&A）：
    - Q: 如何安装技能？
    - Q: 如何使用 Task 推荐？
    - Q: 收藏夹在哪里查看？
    - Q: 如何删除已收藏的技能？
    - Q: 显示"目录未找到"怎么办？
- 所有弹窗：点击背景遮罩层可关闭，支持 ESC 键关闭

### 排序交互
- 排序控件为下拉选择器
- 选项：名称（升序）/ 名称（降序）/ 使用次数 / 添加时间 / 难度

---

## 设计系统

### 色彩方案

基于以下配色（优先使用）：

| Token | 颜色 | 用途 |
|-------|------|------|
| accent-100 | #71c4ef | 主强调色，发光效果 |
| accent-200 | #00668c | 次强调色，图标/标签 |
| primary-100 | #d4eaf7 | 悬浮高亮 |
| primary-200 | #b6ccd8 | 边框，次要文字 |
| primary-300 | #3b3c3d | 深色卡片背景 |

**深色主题适配：**
- 背景主色：#0a0a0f
- 卡片背景：#1a1a2e
- 文字主色：#ffffff
- 文字次色：#b6ccd8
- 边框色：#3b3c3d
- 发光：#71c4ef

### 字体
- 主字体：Inter
- 代码字体：JetBrains Mono

### 间距
- 8px 网格系统
- 卡片间距：16-24px
- 内边距：16/24/32px

### 圆角
- 卡片：12-16px
- 按钮：8px
- 弹窗：16-20px

### 阴影/发光
- 卡片阴影：`0 4px 20px rgba(113, 196, 239, 0.1)`
- 聚焦发光：`0 0 20px rgba(113, 196, 239, 0.3)`

### 图标规范
**强制要求**：禁止使用 emoji，必须使用线性图标库
**图标风格**: 线性图标（Line Icons），与科技感风格搭配
**必须使用以下图标库之一**（项目需安装对应 npm 包）：
- **Lucide Icons**（推荐，`lucide-react`）
- **Phosphor Icons**（`@phosphor-icons/react`）
- **Heroicons**（`@heroicons/react`）

**各分类图标**（使用图标库中的对应图标，禁止 emoji）：
| 分类 ID | 显示名称 | Lucide Icons 推荐 |
|---------|---------|------------------|
| framework | 开发框架 | `PuzzlePiece` |
| database | 数据库 | `Database` |
| testing | 测试 | `FlaskConical` 或 `TestTube` |
| workflow | 工作流 | `Workflow` 或 `GitBranch` |
| business | 商业 | `Briefcase` |
| devops | DevOps | `Rocket` |
| security | 安全 | `Shield` 或 `Lock` |
| language | 语言 | `Code` 或 `Braces` |
| other | 其他 | `Box` |

**注意**：分类 ID 用于代码和筛选逻辑，显示名称用于界面文字；图标必须从图标库选取，不能用 emoji 替代

**其他图标用途**（必须从图标库选取，不能用 emoji）：
| 用途 | Lucide Icons 推荐 | 说明 |
|------|------------------|------|
| 搜索 | `Search` | 放大镜图标 |
| 收藏 | `Star` | 实心/空心星形 |
| 复制 | `Copy` 或 `Clipboard` | 剪贴板图标 |
| 关闭 | `X` | 关闭按钮 |
| 排序下拉 | `ChevronDown` | 下拉箭头 |
| 帮助 | `HelpCircle` 或 `CircleHelp` | 问号图标 |
| 统计 | `BarChart3` 或 `TrendingUp` | 图表图标 |
| Dashboard | `LayoutDashboard` | 仪表盘图标 |
| Skills | `BookOpen` 或 `GraduationCap` | 技能/学习相关 |
| Agents | `Bot` 或 `Cpu` | 机器人图标 |
| Commands | `Terminal` 或 `Zap` | 命令/闪电图标 |
| 最近使用 | `Clock` 或 `History` | 时间/历史图标 |

---

## 状态设计

### 加载状态
- 骨架屏（Skeleton Screen）
- 与实际布局结构一致
- 深色风格占位动画

### 空状态
| 场景 | 文案 |
|------|------|
| 无收藏 | "还没有收藏任何技能，试试点击技能卡片的 Star 图标来收藏常用技能" |
| 无搜索结果 | "没有找到匹配的技能，试试其他关键词或清除筛选" |
| 首次使用 | "从这里开始：浏览技能 / 使用 Task 推荐" |

### 错误状态
- 加载失败：显示重试按钮
- Claude Code 目录未找到：显示配置指引

---

## 动画效果

| 元素 | 动画 |
|------|------|
| 卡片悬浮 | 发光边框渐入 + scale(1.02) + 阴影扩散 |
| 弹窗 | scale(0.95) → scale(1) + fadeIn |
| 分类切换 | 侧边栏滑动指示器 |
| 收藏按钮 | 星星弹跳（点击时 scale(1) → scale(1.3) → scale(1)，400ms bounce ease） |
| 页面切换 | 淡入淡出（opacity 0→1，200ms ease-out） |
| Tab 切换 | 内容淡入淡出（opacity 0→1，150ms ease-out） |

---

## 技术要求

### 技术栈（需告知设计师）
- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **类型**: TypeScript
- **状态管理**: React useState/useContext
- **图标**: **必须使用线性图标库**（Lucide Icons 或 Phosphor Icons 或 Heroicons），**禁止使用 emoji**
- **图标库安装命令（示例）**:
  - Lucide Icons: `npm install lucide-react`

### 浏览器兼容
- 现代浏览器（Chrome/Firefox/Safari/Edge 最新两个版本）

### 可访问性要求（Accessibility）
- 弹窗：使用 `role="dialog"` + `aria-modal="true"` + `aria-labelledby` 指向标题
- 下拉列表：使用 `role="listbox"` + `aria-expanded` + `aria-activedescendant`
- 按钮：所有可点击元素必须有 `aria-label`（如收藏按钮、复制按钮）
- 颜色对比度：文字与背景对比度 ≥ 4.5:1（次要文字可 ≥ 3:1）
- 焦点可见：悬浮和键盘焦点使用相同的视觉样式（不能只有 hover 没有 focus 样式）

### 主题
- **默认深色主题**
- 是否需要浅色模式切换待确认（可先只做深色）

### 层级关系（z-index）
| 层级 | 元素 | z-index |
|------|------|---------|
| 1 | 页面内容 | 0 |
| 2 | Header | 40 |
| 3 | 弹窗背景遮罩 | 50，样式：#0a0a0f，opacity 75%（接近纯黑但略有透明感） |
| 4 | 弹窗内容 | 60 |
| 5 | Toast 通知 | 70 |

### 动效时长（实现约束）
| 动画类型 | 时长 | 说明 |
|---------|------|------|
| 卡片悬浮 | 200ms | ease-out |
| 弹窗进入 | 250ms | scale(0.95→1) + fadeIn，ease-out |
| 弹窗退出 | 200ms | scale(1→0.95) + fadeOut，ease-in |
| Toast 显示 | 300ms | 从右侧滑入 + fadeIn |
| Toast 隐藏 | 300ms | 向右侧滑出 + fadeOut |
| 侧边栏指示器滑动 | 250ms | cubic-bezier(0.4, 0, 0.2, 1) |
| 收藏按钮弹跳 | 400ms | bounce ease |

### 数据持久化
- localStorage 存储：收藏夹、使用记录、Onboarding 完成状态
- localStorage key 命名规范：
  - `feature-menu:favorites` - 收藏的技能/代理 ID 列表（数组）
  - `feature-menu:usage` - 使用记录（对象，key 为 ID，value 包含 lastUsedAt 和 usageCount）
  - `feature-menu:onboarding-completed` - Onboarding 是否已完成（布尔值）
- 无后端，数据来源于客户端本地文件扫描（skills、agents、commands 目录扫描）

---

## 组件清单

### 页面组件
| 组件 | 说明 |
|------|------|
| Header | 顶部导航栏，高度 56px，深色背景（#0a0a0f）；左侧：Logo（"Feature Menu" 文字 + `Sparkles` 图标，16px）；中间：Tab 切换（Dashboard / Skills / Agents / Commands），当前页高亮（青色下划线）；右侧：RecentDropdown 最近使用下拉 |
| Sidebar / CategoryNav | 左侧分类导航，宽度固定 220px；顶部：当前类型标题（如"技能分类"）；中部：分类列表（每项含图标 + 名称）；底部：FavoriteList 收藏列表；选中状态：青色背景高亮 + 左侧滑动指示器（2px 宽，#71c4ef） |
| SearchBar | 搜索框，含聚焦发光、搜索建议下拉；聚焦样式：2px 青色边框发光（#71c4ef）；下拉列表：深色背景（#1a1a2e），每项高度 40px，内边距 12px 16px，悬浮时青色背景（#71c4ef 20% 透明度） |
| SortDropdown | 排序下拉选择器，触发器样式：深色背景 + 边框 + ChevronDown 下拉箭头；下拉列表：深色背景（#1a1a2e），每项 36px 高，悬浮青色背景；排序选项：名称（升序）、名称（降序）、使用次数、添加时间、难度 |
| FilterChips | 筛选标签芯片组，标签样式：深色背景（#1a1a2e），青色边框（#71c4ef），圆角 16px（药丸形），内边距 4px 12px；关闭按钮：右侧 × 图标（hover 时显示）；包含筛选选项：按分类（开发框架/数据库/测试/工作流/商业/DevOps/安全/语言/其他）和按状态（已收藏）；右侧有"清除全部"按钮（仅在有筛选时可见，点击移除所有筛选） |
| SkillCard | 技能卡片，尺寸：宽度 100%（grid 自适应），高度不固定；内容布局（从上到下，左对齐）：第一行左侧 32x32 图标 + 名称，第二行描述摘要（12px，#b6ccd8，最多 2 行），第三行底部标签行（分类标签 + 难度等级）；收藏按钮固定在整张卡片右上角（position: absolute）；卡片内边距：24px；悬浮状态：边框渐变发光（从左到右 #71c4ef → #a855f7）+ scale(1.02) + 阴影扩散（200ms ease-out）+ cursor: pointer；**悬浮时只保留视觉特效，不显示任何文字提示** |
| AgentCard | 代理卡片，布局与 SkillCard 完全一致（图标、名称、描述、收藏按钮、分类标签、难度等级）；区别：代理卡片底部显示"代理"标签而非"技能"；收藏按钮功能与 SkillCard 相同 |
| CommandCard | 命令卡片，内容：图标（左侧，24x24）+ 命令名称（粗体）+ 命令内容（代码格式，JetBrains Mono，12px）+ 描述摘要（12px）；命令内容样式：深色背景（#1a1a2e）+ 内边距 12px 16px + 圆角 8px + 文字颜色 #71c4ef（发光感）；交互：点击整张卡片或点击复制按钮，复制命令到剪贴板，复制成功后显示 Toast；悬浮状态：边框渐变发光 + cursor: pointer |
| StatsCard | 统计卡片（Dashboard 用），尺寸：3 列 grid，每列等宽；内容：数字（32px，粗体，白色）+ 标签（12px，#b6ccd8）+ 图标（24x24，顶部居中）；Skills 用 `BookOpen`，Agents 用 `Bot`，Commands 用 `Terminal`；卡片背景 #1a1a2e，圆角 16px |
| QuickActionCard | 快捷操作入口卡片，尺寸：2 列 grid，每列等宽；内容：图标（32x32，#71c4ef，左侧）+ 标题（14px，粗体）+ 描述（12px，#b6ccd8）；Task 推荐图标用 `Zap`，Help 图标用 `HelpCircle`；背景 #1a1a2e，圆角 16px |

### 弹窗组件
| 组件 | 说明 |
|------|------|
| SkillDetail | 技能详情弹窗 |
| TaskWizard | 任务推荐向导（2 步） |
| Help | 帮助弹窗（Glossary + FAQ，Tab 切换） |
| Onboarding | 新手引导弹窗（4 步） |

### 状态组件
| 组件 | 说明 |
|------|------|
| SkeletonCard | 骨架屏卡片，布局与实际 SkillCard 完全一致；样式：深色占位块（#1a1a2e），动画：shimmer 效果（渐变从左到右扫过，1.5s 循环）；包含：图标占位（32x32 圆形）+ 文字占位（2 行）+ 标签占位 |
| EmptyState | 空状态组件，垂直居中布局；内容：图标（64x64，#3b3c3d 颜色）+ 主标题（16px，白色）+ 副标题（14px，#b6ccd8）+ 操作按钮（如有）；不同场景使用不同图标 |
| Toast | 通知提示（右下角，2-3s 自动消失） |

### 其他组件
| 组件 | 说明 |
|------|------|
| RecentDropdown | 最近使用技能下拉组件；Header 内为收起状态（点击展开），Dashboard 内为默认展开状态（显示最近 5 条）；数据源来自 usage 记录，每条显示名称 + 图标 + 使用次数 |
| FavoriteList | 收藏列表（侧边栏底部）；内容：`Star` 图标 + "收藏夹"标题 + 已收藏数量（徽章）；交互：点击整块区域 → 跳转至 Skills 页面 + 自动激活"收藏"筛选标签（等价于手动点击 FilterChips 中的"已收藏"） |

### 组件状态变体
每个组件需要设计以下状态：
- **默认状态**
- **悬浮状态**（Hover）
- **激活/选中状态**（Active/Selected）
- **禁用状态**（Disabled）
- **加载状态**（Loading，骨架屏）
- **错误状态**（Error，如适用）

## 输出要求

1. Figma 文件链接
2. 组件变体说明（状态：默认/悬浮/禁用/加载等）
3. 关键尺寸和间距标注
4. 设计规范（颜色/字体/间距/动画）
5. 深色主题为主版本（可额外提供浅色版本供参考）
