#!/bin/bash
# 异步记录技能使用 - PostToolUse Hook (matcher: Skill)
# 此脚本在 Skill 工具调用成功后执行，不阻塞 Claude Code

read -r input

# 提取工具名称
tool_name=$(echo "$input" | jq -r '.tool_name // empty')

# 只处理 Skill 工具（matcher 已过滤，此处二次确认）
if [[ "$tool_name" != "Skill" ]]; then
  exit 0
fi

# 提取 skill 字段
# 格式: {"skill": "superpowers:brainstorming"} 或 {"skill": "agent-reach", "args": "..."}
skill=$(echo "$input" | jq -r '.tool_input.skill // empty')

if [[ -z "$skill" ]]; then
  exit 0
fi

# 统一处理：去掉命名空间前缀
# "superpowers:brainstorming" -> "brainstorming"
# "agent-reach" -> "agent-reach"
if [[ "$skill" == *:* ]]; then
  skill_id=$(echo "$skill" | awk -F':' '{print $NF}')
else
  skill_id="$skill"
fi

# Claude Code 根目录
CLAUDE_ROOT="${CLAUDE_CODE_ROOT:-$HOME/.claude}"
USAGE_FILE="$CLAUDE_ROOT/skills-usage.json"
TMP_FILE=$(mktemp)

# 读取或创建数据文件
if [[ -f "$USAGE_FILE" ]]; then
  jq --arg skill "$skill_id" '
    .version = 1 |
    .lastUpdated = now |
    .stats[$skill] = (.stats[$skill] // 0) + 1 |
    .lastSession = now |
    if (.recent | index($skill)) >= 0 then
      .recent = [($skill) + (.recent | del(.[0 | select(. == $skill)]))]
    else
      .recent = [($skill) + .recent[0:9]]
    end
  ' "$USAGE_FILE" > "$TMP_FILE"
else
  jq -n --arg skill "$skill_id" '{
    version: 1,
    lastUpdated: now,
    stats: {($skill): 1},
    recent: [$skill],
    lastSession: now
  }' > "$TMP_FILE"
fi

mv "$TMP_FILE" "$USAGE_FILE"
exit 0
