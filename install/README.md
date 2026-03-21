# 使用量统计 Hook 安装指南

## 自动安装（推荐）

在 Feature Menu 页面中，点击「启用使用统计」按钮即可一键安装。

## 手动安装

如果自动安装失败，请按以下步骤手动操作：

### 步骤 1：创建 hooks 目录

```bash
mkdir -p ~/.claude/hooks
```

### 步骤 2：复制 hook 脚本

将 `install/log-skill-usage.sh` 复制到 `~/.claude/hooks/` 目录：

```bash
cp projects/feature-menu/install/log-skill-usage.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/log-skill-usage.sh
```

### 步骤 3：安装 jq

**macOS:**
```bash
brew install jq
```

**Ubuntu/Debian:**
```bash
sudo apt install jq
```

**验证安装:**
```bash
jq --version
```

### 步骤 4：配置 Claude Code Hook

编辑 `~/.claude/settings.json`（如果不存在则创建）：

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

**注意**：
- 如果文件中已有其他 `hooks` 配置，请合并而不是替换
- `command` 路径是相对于 `$HOME` 的

### 步骤 5：重启 Claude Code

修改 settings.json 后，需要重启 Claude Code 新会话才能生效。

## 验证安装

1. 在 Claude Code 中使用任意技能（如 `/brainstorm`）
2. 检查 `~/.claude/skills-usage.json` 文件是否被创建
3. 文件内容应该包含类似：

```json
{
  "version": 1,
  "lastUpdated": 1742544000,
  "stats": {
    "brainstorming": 1
  },
  "recent": ["brainstorming"]
}
```

## 卸载

1. 删除 hook 脚本：`rm ~/.claude/hooks/log-skill-usage.sh`
2. 从 `~/.claude/settings.json` 中移除 hook 配置
3. 重启 Claude Code
