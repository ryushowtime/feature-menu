# Feature Menu - Claude Code 功能中心

一键浏览和管理你所有已安装的 Claude Code 技能、代理和命令。

## 功能特点

- **技能浏览** - 查看所有已安装的技能、代理和命令
- **分类筛选** - 按类别快速找到需要的工具
- **搜索功能** - 关键词搜索，瞬间定位
- **任务推荐** - 告诉它你想做什么，它推荐合适的技能
- **收藏功能** - 收藏常用技能，方便快速访问
- **最近使用** - 快速访问最近使用过的技能

## 安装方式

### 方式 1：作为 Claude Code 插件安装（推荐）

```bash
# 在 Claude Code 中输入：
/plugin install ryushowtime/feature-menu
```

然后输入 `/feature-menu` 即可使用！

### 方式 2：手动安装

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

# 或者手动启动
npm run dev
```

4. 打开浏览器访问 http://localhost:3000

## 使用方法

在 Claude Code 中输入：

```
/feature-menu
```

或者告诉 Claude "打开功能中心"

## 系统要求

- Node.js 18+
- npm 或 yarn
- Claude Code（用于插件方式）

## 项目结构

```
feature-menu/
├── app/              # Next.js 应用
├── components/       # React 组件
├── lib/              # 工具库
├── bin/              # CLI 入口
├── SKILL.md          # Claude Code 技能文件
└── README.md         # 本文件
```

## 故障排除

### 服务启动失败

```bash
npm install
npm run dev
```

### 端口被占用

```bash
PORT=3001 npm run dev
```

## 许可证

MIT License

## 作者

ryushowtime
