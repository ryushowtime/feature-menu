---
name: feature-menu
description: 打开 Claude Code 功能中心 - 浏览和管理已安装的技能、代理和命令
origin: https://github.com/ryushowtime/feature-menu
---

# Feature Menu - Claude Code 功能中心

一键打开功能中心，浏览和管理你所有已安装的技能、代理和命令。

## When to Activate

- 用户说"打开功能中心"、"feature menu"、"功能菜单"
- 用户想浏览已安装的技能
- 用户想查看技能的使用场景和触发方式
- 用户想收藏或搜索技能

## 使用方式

在 Claude Code 中直接输入：

```
/feature-menu
```

或者告诉 Claude "打开功能中心"

## 执行步骤

当用户激活此技能时，执行以下步骤：

### 步骤 1: 启动服务

使用 Bash 工具启动 Next.js 开发服务器：

```bash
cd ~/feature-menu && npm run dev
```

如果用户没有安装过，需要先安装：

```bash
cd ~/feature-menu && npm install && npm run dev
```

让服务在后台运行。

### 步骤 2: 等待服务就绪

等待 3-5 秒让服务启动。

### 步骤 3: 自动打开浏览器

使用平台适当的命令打开浏览器：

- macOS: `open http://localhost:3000`
- Linux: `xdg-open http://localhost:3000`
- Windows: `start http://localhost:3000`

### 步骤 4: 通知用户

告诉用户：

```
✅ Feature Menu 已启动！
📍 访问 http://localhost:3000 查看功能中心
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
