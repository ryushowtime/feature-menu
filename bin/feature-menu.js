#!/usr/bin/env node

/**
 * Feature Menu - Claude Code 功能中心
 * 一键启动脚本，支持 npx feature-menu 运行
 */

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

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

// 检查并清理端口 3000
function clearPort3000() {
  const platform = os.platform();
  try {
    if (platform === 'darwin') {
      // macOS: 查找占用端口 3000 的进程
      const result = execSync('lsof -i :3000 -t 2>/dev/null', { encoding: 'utf8' });
      const pids = result.trim().split('\n').filter(Boolean);
      if (pids.length > 0) {
        console.log(`⚠️  端口 3000 被占用，正在结束进程...`);
        for (const pid of pids) {
          execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        }
        console.log('✅ 端口 3000 已释放');
      }
    } else if (platform === 'win32') {
      // Windows: 查找占用端口 3000 的进程
      const result = execSync('netstat -ano | findstr :3000', { encoding: 'utf8', shell: 'cmd.exe' });
      const lines = result.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid)) {
          console.log(`⚠️  端口 3000 被占用，正在结束进程 PID ${pid}...`);
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore', shell: 'cmd.exe' });
        }
      }
      console.log('✅ 端口 3000 已释放');
    }
  } catch (error) {
    // 端口未被占用或命令执行失败，继续
  }
}

const claudeRoot = detectClaudeCodeRoot();
if (claudeRoot) {
  process.env.CLAUDE_CODE_ROOT = claudeRoot;
}

// 清理端口
clearPort3000();

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