#!/usr/bin/env node
/**
 * Package Manager Setup Script
 *
 * Interactive script to configure preferred package manager.
 * Can be run directly or via the /setup-pm command.
 *
 * Usage:
 *   node scripts/setup-package-manager.js [pm-name]
 *   node scripts/setup-package-manager.js --detect
 *   node scripts/setup-package-manager.js --global pnpm
 *   node scripts/setup-package-manager.js --project bun
 */

const {
  PACKAGE_MANAGERS,
  getPackageManager,
  setPreferredPackageManager,
  setProjectPackageManager,
  getAvailablePackageManagers,
  detectFromLockFile,
  detectFromPackageJson
} = require('./lib/package-manager');

function showHelp() {
  console.log(`
Claude Code 包管理器设置 (Package Manager Setup)

用法:
  node scripts/setup-package-manager.js [options] [package-manager]

选项:
  --detect        检测并显示当前包管理器
  --global <pm>   设置全局偏好 (保存到 ~/.claude/package-manager.json)
  --project <pm>  设置项目偏好 (保存到 .claude/package-manager.json)
  --list          列出可用的包管理器
  --help          显示此帮助信息

包管理器:
  npm             Node 包管理器 (Node.js 默认)
  pnpm            快速、节省磁盘空间的包管理器
  yarn            经典的 Yarn 包管理器
  bun             多合一 JavaScript 运行时和工具包

示例:
  # 检测当前包管理器
  node scripts/setup-package-manager.js --detect

  # 将 pnpm 设置为全局偏好
  node scripts/setup-package-manager.js --global pnpm

  # 为当前项目设置 bun
  node scripts/setup-package-manager.js --project bun

  # 列出可用的包管理器
  node scripts/setup-package-manager.js --list
`);
}

function detectAndShow() {
  const pm = getPackageManager();
  const available = getAvailablePackageManagers();
  const fromLock = detectFromLockFile();
  const fromPkg = detectFromPackageJson();

  console.log('\n=== 包管理器检测 (Package Manager Detection) ===\n');

  console.log('当前选择:');
  console.log(`  包管理器: ${pm.name}`);
  console.log(`  来源: ${pm.source}`);
  console.log('');

  console.log('检测结果:');
  console.log(`  来自 package.json: ${fromPkg || '未指定'}`);
  console.log(`  来自锁文件: ${fromLock || '未找到'}`);
  console.log(`  环境变量: ${process.env.CLAUDE_PACKAGE_MANAGER || '未设置'}`);
  console.log('');

  console.log('可用包管理器:');
  for (const pmName of Object.keys(PACKAGE_MANAGERS)) {
    const installed = available.includes(pmName);
    const indicator = installed ? '✓' : '✗';
    const current = pmName === pm.name ? ' (当前)' : '';
    console.log(`  ${indicator} ${pmName}${current}`);
  }

  console.log('');
  console.log('命令:');
  console.log(`  安装: ${pm.config.installCmd}`);
  console.log(`  运行脚本: ${pm.config.runCmd} [script-name]`);
  console.log(`  执行二进制: ${pm.config.execCmd} [binary-name]`);
  console.log('');
}

function listAvailable() {
  const available = getAvailablePackageManagers();
  const pm = getPackageManager();

  console.log('\n可用包管理器:\n');

  for (const pmName of Object.keys(PACKAGE_MANAGERS)) {
    const config = PACKAGE_MANAGERS[pmName];
    const installed = available.includes(pmName);
    const current = pmName === pm.name ? ' (当前)' : '';

    console.log(`${pmName}${current}`);
    console.log(`  已安装: ${installed ? '是' : '否'}`);
    console.log(`  锁文件: ${config.lockFile}`);
    console.log(`  安装命令: ${config.installCmd}`);
    console.log(`  运行命令: ${config.runCmd}`);
    console.log('');
  }
}

function setGlobal(pmName) {
  if (!PACKAGE_MANAGERS[pmName]) {
    console.error(`错误: 未知的包管理器 "${pmName}"`);
    console.error(`可用选项: ${Object.keys(PACKAGE_MANAGERS).join(', ')}`);
    process.exit(1);
  }

  const available = getAvailablePackageManagers();
  if (!available.includes(pmName)) {
    console.warn(`警告: ${pmName} 尚未安装在您的系统上`);
  }

  try {
    setPreferredPackageManager(pmName);
    console.log(`\n✓ 全局偏好已设置为: ${pmName}`);
    console.log('  已保存到: ~/.claude/package-manager.json');
    console.log('');
  } catch (err) {
    console.error(`错误: ${err.message}`);
    process.exit(1);
  }
}

function setProject(pmName) {
  if (!PACKAGE_MANAGERS[pmName]) {
    console.error(`错误: 未知的包管理器 "${pmName}"`);
    console.error(`可用选项: ${Object.keys(PACKAGE_MANAGERS).join(', ')}`);
    process.exit(1);
  }

  try {
    setProjectPackageManager(pmName);
    console.log(`\n✓ 项目偏好已设置为: ${pmName}`);
    console.log('  已保存到: .claude/package-manager.json');
    console.log('');
  } catch (err) {
    console.error(`错误: ${err.message}`);
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--detect')) {
  detectAndShow();
  process.exit(0);
}

if (args.includes('--list')) {
  listAvailable();
  process.exit(0);
}

const globalIdx = args.indexOf('--global');
if (globalIdx !== -1) {
  const pmName = args[globalIdx + 1];
  if (!pmName) {
    console.error('错误: --global 需要指定包管理器名称');
    process.exit(1);
  }
  setGlobal(pmName);
  process.exit(0);
}

const projectIdx = args.indexOf('--project');
if (projectIdx !== -1) {
  const pmName = args[projectIdx + 1];
  if (!pmName) {
    console.error('错误: --project 需要指定包管理器名称');
    process.exit(1);
  }
  setProject(pmName);
  process.exit(0);
}

// If just a package manager name is provided, set it globally
const pmName = args[0];
if (PACKAGE_MANAGERS[pmName]) {
  setGlobal(pmName);
} else {
  console.error(`错误: 未知选项或包管理器 "${pmName}"`);
  showHelp();
  process.exit(1);
}
