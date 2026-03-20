---
name: feature-menu
description: 打开 Claude Code 功能中心 - 浏览和管理已安装的技能、代理和命令
origin: https://github.com/ryushowtime/feature-menu
---

# Feature Menu - Claude Code 功能中心

一键打开功能中心，浏览和管理你所有已安装的技能、代理和命令。

## When to Activate

- 用户说"打开功能中心"、"feature menu"、"功能菜单"
- 用户想浏览已安装的技能、代理或命令
- 用户想查看技能的使用场景和触发方式
- 用户想收藏或搜索技能
- 用户询问"有什么 skill"、"有什么命令"、"有什么 agent"、"有哪些技能"、"有哪些命令"
- 用户说"想用技能"、"想用命令"、"想用代理"、"要用技能"、"要用命令"
- 用户说"推荐个技能"、"推荐个命令"、"推荐个代理"、"有什么好用的技能"
- 用户表达想了解或使用 Claude Code 的技能、命令、代理功能

## 使用方式

在 Claude Code 中直接输入：

```
/feature-menu
```

或者告诉 Claude "打开功能中心"

## 执行步骤

当用户激活此技能时，执行以下步骤：

### 步骤 1: 通知用户

首先告诉用户正在启动功能中心，让用户知道发生了什么：

```
检测到你想要使用技能、命令或代理，正在打开功能中心...
```

### 步骤 2: 启动服务

使用 Bash 工具启动 Next.js 开发服务器（后台运行）：

```bash
cd ~/feature-menu && npm run dev &
```

如果用户没有安装过，需要先安装：

```bash
cd ~/feature-menu && npm install && npm run dev &
```

使用 `&` 让服务在后台运行。

### 步骤 3: 等待服务就绪

等待 3-5 秒让服务启动。

### 步骤 4: 自动打开浏览器

使用平台适当的命令打开浏览器：

- macOS: `open http://localhost:3000`
- Linux: `xdg-open http://localhost:3000`
- Windows: `start http://localhost:3000`

### 步骤 5: 确认启动成功

告诉用户：

```
✅ 功能中心已打开！
📍 访问 http://localhost:3000 查看所有技能、代理和命令
按 Ctrl+C 停止服务
```

## 功能特点

- **技能浏览** - 查看所有已安装的技能、代理和命令
- **分类筛选** - 按类别快速找到需要的工具
- **搜索功能** - 关键词搜索，瞬间定位
- **任务推荐** - 告诉它你想做什么，它推荐合适的技能
- **收藏功能** - 收藏常用技能，方便快速访问
- **最近使用** - 快速访问最近使用过的技能

## 故障排除

### 服务启动失败

如果 `/feature-menu` 命令无法启动服务，手动启动：

```bash
cd ~/feature-menu
npm install
npm run dev
```

然后打开浏览器访问 http://localhost:3000

### 端口被占用

如果 3000 端口被占用，可以指定其他端口：

```bash
PORT=3001 npm run dev
```

### 未安装

如果用户还没有安装 Feature Menu：

```bash
# 克隆仓库
git clone https://github.com/ryushowtime/feature-menu.git ~/feature-menu

# 进入目录
cd ~/feature-menu

# 安装依赖
npm install

# 启动服务
npm run dev
```
