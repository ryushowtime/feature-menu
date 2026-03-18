# Feature Menu - Claude Code 功能中心

[English](README_EN.md) | 中文

---

一键浏览和管理你所有已安装的 Claude Code 技能、代理和命令。

## 功能特点

- **技能浏览** - 查看所有已安装的技能、代理和命令
- **分类筛选** - 按类别快速找到需要的工具
- **搜索功能** - 关键词搜索，瞬间定位
- **任务推荐** - 告诉它你想做什么，它推荐合适的技能
- **收藏功能** - 收藏常用技能，方便快速访问
- **最近使用** - 快速访问最近使用过的技能

## 工作原理

```
┌─────────────────────────────────────────────────────────┐
│                    Feature Menu                          │
│                                                          │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐             │
│   │ Skills  │    │ Agents  │    │Commands │             │
│   └────┬────┘    └────┬────┘    └────┬────┘             │
│        └──────────────┼──────────────┘                  │
│                       ▼                                  │
│            ┌──────────────────┐                         │
│            │   本地文件扫描    │                         │
│            │  (scanner.ts)    │                         │
│            └────────┬─────────┘                         │
│                     ▼                                   │
│         自动检测 Claude Code 目录                        │
│         - CLAUDE_CODE_ROOT 环境变量                     │
│         - ~/.claude                                      │
│         - ~/everything-claude-code                       │
└─────────────────────────────────────────────────────────┘
```

## 安装方式

### 方式 1：作为 Claude Code 插件安装（推荐）

```bash
/plugin install ryushowtime/feature-menu
```

安装后即可使用 `/feature-menu` 命令。

### 方式 2：npx 一键启动

```bash
npx feature-menu
```

### 方式 3：手动安装

1. 克隆仓库：
```bash
git clone https://github.com/ryushowtime/feature-menu.git
cd feature-menu
```

2. 安装依赖：
```bash
npm install
```

3. 启动服务：
```bash
# macOS/Linux
./start.sh

# Windows
start.bat

# 或手动启动
npm run dev
```

4. 打开浏览器访问 http://localhost:3000

## 使用方法

在 Claude Code 中输入：

```
/feature-menu
```

或者告诉 Claude "打开功能中心"、"feature menu"、"功能菜单"。

## 系统要求

| 要求 | 说明 |
|------|------|
| Node.js | 18.0 或更高版本 |
| npm/yarn/pnpm | 任选其一 |
| Claude Code | 仅插件方式需要 |

## 一键启动脚本

| 平台 | 脚本 | 说明 |
|------|------|------|
| macOS/Linux | `start.sh` | 自动检测 Node.js、安装依赖、启动服务、打开浏览器 |
| Windows | `start.bat` | 同上，Windows 批处理版本 |
| npm | `npx feature-menu` | 通过 npm 全球安装后使用 |

## 项目结构

```
feature-menu/
├── app/                    # Next.js 应用
│   ├── page.tsx           # 首页
│   ├── layout.tsx         # 布局组件
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── SkillCard.tsx      # 技能卡片
│   ├── SearchBar.tsx      # 搜索栏
│   ├── CategoryFilter.tsx # 分类筛选
│   └── ...
├── lib/                    # 工具库
│   ├── scanner.ts         # 文件扫描器（自动检测 Claude Code 目录）
│   └── types.ts           # 类型定义
├── bin/                    # CLI 入口
│   └── feature-menu.js    # npx 入口脚本
├── start.sh               # macOS/Linux 启动脚本
├── start.bat              # Windows 启动脚本
├── SKILL.md               # Claude Code 技能文件
└── README.md              # 本文件
```

## 常见问题

### Q: 服务启动后显示 "未检测到 Claude Code 目录"？

**A:** 请确保你的 Claude Code 目录位于以下位置之一：

| 优先级 | 路径 | 说明 |
|--------|------|------|
| 1 | `CLAUDE_CODE_ROOT` 环境变量 | 最高优先级 |
| 2 | `~/.claude` | 标准 Claude Code 目录 |
| 3 | `~/everything-claude-code` | ECC 用户默认目录 |
| 4 | `~/Claude Code` | macOS 默认目录 |

你也可以设置环境变量：
```bash
export CLAUDE_CODE_ROOT=/path/to/your/claude-code-dir
```

### Q: 端口 3000 被占用？

**A:** 指定其他端口：
```bash
PORT=3001 npm run dev
```

### Q: 如何更新到最新版本？

```bash
cd feature-menu
git pull origin main
npm install
```

### Q: 支持的皮肤/主题？

**A:** 目前支持浅色/深色模式自动切换（根据系统设置）。

## 故障排除

### 服务启动失败

```bash
# 1. 确保 Node.js 已安装
node --version

# 2. 删除 node_modules 重新安装
rm -rf node_modules
npm install

# 3. 重新启动
npm run dev
```

### 检测不到 skills 目录

```bash
# 查看详细日志
DEBUG=* npm run dev

# 或手动指定路径
CLAUDE_CODE_ROOT=~/my-claude-dir npm run dev
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持技能、代理、命令浏览
- 支持搜索和分类筛选
- 支持收藏和最近使用
- 自动检测 Claude Code 目录

## 许可证

[MIT License](LICENSE)

## 作者

**ryushowtime**

- GitHub: [@ryushowtime](https://github.com/ryushowtime)
- Twitter: [@ryushowtime](https://twitter.com/ryushowtime)

---

如果你觉得这个项目有帮助，请给它一个 ⭐！
