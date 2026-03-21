/**
 * Feature Menu Hook 安装脚本
 * 用于一键安装使用量统计所需的 Claude Code Hook
 *
 * 使用方式：
 * npx ts-node install/install-hook.ts
 * 或
 * node install/install-hook.ts
 */

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const HOOKS_DIR = path.join(os.homedir(), '.claude', 'hooks');
const SETTINGS_FILE = path.join(os.homedir(), '.claude', 'settings.json');
const HOOK_SCRIPT_SOURCE = path.join(__dirname, 'log-skill-usage.sh');
const HOOK_SCRIPT_DEST = path.join(HOOKS_DIR, 'log-skill-usage.sh');

interface Settings {
  hooks?: Record<string, unknown[]>;
  [key: string]: unknown;
}

async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

async function fileExists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function copyHookScript(): Promise<void> {
  console.log('📁 创建 hooks 目录...');
  await ensureDir(HOOKS_DIR);

  console.log('📄 复制 hook 脚本...');
  await fs.copyFile(HOOK_SCRIPT_SOURCE, HOOK_SCRIPT_DEST);

  // 设置执行权限
  const stats = await fs.stat(HOOK_SCRIPT_DEST);
  await fs.chmod(HOOK_SCRIPT_DEST, stats.mode | 0o111);

  console.log('✅ hook 脚本已安装到:', HOOK_SCRIPT_DEST);
}

async function updateSettings(): Promise<void> {
  console.log('⚙️  更新 settings.json...');

  let settings: Settings = {};
  let existingSettings = false;

  if (await fileExists(SETTINGS_FILE)) {
    try {
      const content = await fs.readFile(SETTINGS_FILE, 'utf-8');
      settings = JSON.parse(content);
      existingSettings = true;
      console.log('📖 读取现有 settings.json');
    } catch (error) {
      console.warn('⚠️  无法读取现有 settings.json，将创建新文件');
    }
  }

  // 初始化 hooks 对象
  if (!settings.hooks) {
    settings.hooks = {};
  }

  // 添加 PostToolUse Hook 配置
  const postToolUseHooks = settings.hooks['PostToolUse'] || [];

  // 检查是否已存在此 hook 配置
  const hasExistingHook = postToolUseHooks.some((hook: unknown) => {
    const h = hook as { hooks?: Array<{ command?: string }> };
    return h?.hooks?.some?.((h2) => h2?.command === '.claude/hooks/log-skill-usage.sh');
  });

  if (hasExistingHook) {
    console.log('ℹ️  hook 配置已存在，跳过');
  } else {
    const newHookConfig = {
      matcher: 'Skill',
      hooks: [
        {
          type: 'command',
          command: '.claude/hooks/log-skill-usage.sh',
          async: true,
        },
      ],
    };

    settings.hooks['PostToolUse'] = [...postToolUseHooks, newHookConfig];
  }

  // 写回 settings.json
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  console.log('✅ settings.json 已更新');
}

async function main(): Promise<void> {
  console.log('🔧 Feature Menu - Hook 安装程序');
  console.log('==============================\n');

  try {
    // 1. 检查 jq 是否安装
    console.log('🔍 检查 jq 安装状态...');
    try {
      const { execSync } = require('child_process');
      execSync('jq --version', { stdio: 'pipe' });
      console.log('✅ jq 已安装');
    } catch {
      console.log('⚠️  jq 未安装');
      console.log('   请运行: brew install jq (macOS) 或 apt install jq (Linux)');
      console.log('   安装后重新运行此脚本\n');
    }

    // 2. 复制 hook 脚本
    await copyHookScript();

    // 3. 更新 settings.json
    await updateSettings();

    console.log('\n🎉 安装完成！');
    console.log('\n📝 下一步：');
    console.log('   1. 重启 Claude Code 使配置生效');
    console.log('   2. 在 Claude Code 中使用技能');
    console.log('   3. 打开 Feature Menu 查看使用统计');
  } catch (error) {
    console.error('\n❌ 安装失败:', error);
    process.exit(1);
  }
}

main();
