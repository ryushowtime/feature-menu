#!/usr/bin/env node

/**
 * Feature Menu - Claude Code 功能中心
 * 一键启动脚本，支持 npx feature-menu 运行
 */

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// 获取项目根目录
const projectRoot = path.resolve(__dirname, '..');

console.log('🔮 Feature Menu 启动中...\n');

// 检测 Claude Code 目录
function detectClaudeCodeRoot() {
  const homeDir = os.homedir();
  const commonPaths = [
    path.join(homeDir, 'everything-claude-code'),
    path.join(homeDir, '.claude'),
  ];

  for (const p of commonPaths) {
    try {
      require('fs').accessSync(path.join(p, 'skills'));
      console.log(`📂 检测到 Claude Code 目录: ${p}`);
      return p;
    } catch {}
  }

  console.log('⚠️  未检测到 Claude Code 目录，将使用默认路径');
  return null;
}

const claudeRoot = detectClaudeCodeRoot();
if (claudeRoot) {
  process.env.CLAUDE_CODE_ROOT = claudeRoot;
}

console.log('');

// 启动 Next.js 开发服务器
console.log('🚀 启动服务...\n');

const devProcess = spawn('npm', ['run', 'dev'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: os.platform() === 'win32'
});

// 自动打开浏览器
setTimeout(() => {
  const openCmd = os.platform() === 'win32' ? 'start' : os.platform() === 'darwin' ? 'open' : 'xdg-open';
  spawn(openCmd, ['http://localhost:3000'], { detached: true, shell: true });
}, 3000);

console.log('📍 访问 http://localhost:3000');
console.log('按 Ctrl+C 停止服务\n');

// 处理退出
process.on('SIGINT', () => {
  console.log('\n👋 停止服务');
  devProcess.kill();
  process.exit(0);
});
