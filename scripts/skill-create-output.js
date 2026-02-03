#!/usr/bin/env node
/**
 * Skill Creator - Pretty Output Formatter
 *
 * Creates beautiful terminal output for the /skill-create command
 * similar to @mvanhorn's /last30days skill
 */

// ANSI color codes - no external dependencies
const chalk = {
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  magenta: (s) => `\x1b[35m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  white: (s) => `\x1b[37m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bgCyan: (s) => `\x1b[46m${s}\x1b[0m`,
};

// Box drawing characters
const BOX = {
  topLeft: '╭',
  topRight: '╮',
  bottomLeft: '╰',
  bottomRight: '╯',
  horizontal: '─',
  vertical: '│',
  verticalRight: '├',
  verticalLeft: '┤',
};

// Progress spinner frames
const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

// Helper functions
function box(title, content, width = 60) {
  const lines = content.split('\n');
  const top = `${BOX.topLeft}${BOX.horizontal} ${chalk.bold(chalk.cyan(title))} ${BOX.horizontal.repeat(width - title.length - 5)}${BOX.topRight}`;
  const bottom = `${BOX.bottomLeft}${BOX.horizontal.repeat(width - 1)}${BOX.bottomRight}`;
  const middle = lines.map(line => {
    const padding = width - 3 - stripAnsi(line).length;
    return `${BOX.vertical} ${line}${' '.repeat(Math.max(0, padding))} ${BOX.vertical}`;
  }).join('\n');
  return `${top}\n${middle}\n${bottom}`;
}

function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function progressBar(percent, width = 30) {
  const filled = Math.round(width * percent / 100);
  const empty = width - filled;
  const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  return `${bar} ${chalk.bold(percent)}%`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function animateProgress(label, steps, callback) {
  process.stdout.write(`\n${chalk.cyan('⏳')} ${label}...\n`);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    process.stdout.write(`   ${chalk.gray(SPINNER[i % SPINNER.length])} ${step.name}`);
    await sleep(step.duration || 500);
    process.stdout.clearLine?.(0) || process.stdout.write('\r');
    process.stdout.cursorTo?.(0) || process.stdout.write('\r');
    process.stdout.write(`   ${chalk.green('✓')} ${step.name}\n`);
    if (callback) callback(step, i);
  }
}

// Main output formatter
class SkillCreateOutput {
  constructor(repoName, options = {}) {
    this.repoName = repoName;
    this.options = options;
    this.width = options.width || 70;
  }

  header() {
    const subtitle = `正在从 ${chalk.cyan(this.repoName)} 提取模式`;

    console.log('\n');
    console.log(chalk.bold(chalk.magenta('╔════════════════════════════════════════════════════════════════╗')));
    console.log(chalk.bold(chalk.magenta('║')) + chalk.bold('  🔮 ECC 技能创建器 (Skill Creator)                             ') + chalk.bold(chalk.magenta('║')));
    console.log(chalk.bold(chalk.magenta('║')) + `     ${subtitle}${' '.repeat(Math.max(0, 55 - stripAnsi(subtitle).length))}` + chalk.bold(chalk.magenta('║')));
    console.log(chalk.bold(chalk.magenta('╚════════════════════════════════════════════════════════════════╝')));
    console.log('');
  }

  async analyzePhase(data) {
    const steps = [
      { name: '正在解析 git 历史...', duration: 300 },
      { name: `发现 ${chalk.yellow(data.commits)} 次提交`, duration: 200 },
      { name: '正在分析提交模式...', duration: 400 },
      { name: '正在检测文件协同更改...', duration: 300 },
      { name: '正在识别工作流...', duration: 400 },
      { name: '正在提取架构模式...', duration: 300 },
    ];

    await animateProgress('正在分析仓库', steps);
  }

  analysisResults(data) {
    console.log('\n');
    console.log(box('📊 分析结果', `
${chalk.bold('已分析提交:')}     ${chalk.yellow(data.commits)}
${chalk.bold('时间范围:')}       ${chalk.gray(data.timeRange)}
${chalk.bold('贡献者:')}         ${chalk.cyan(data.contributors)}
${chalk.bold('跟踪文件:')}       ${chalk.green(data.files)}
`));
  }

  patterns(patterns) {
    console.log('\n');
    console.log(chalk.bold(chalk.cyan('🔍 发现的关键模式:')));
    console.log(chalk.gray('─'.repeat(50)));

    patterns.forEach((pattern, i) => {
      const confidence = pattern.confidence || 0.8;
      const confidenceBar = progressBar(Math.round(confidence * 100), 15);
      console.log(`
  ${chalk.bold(chalk.yellow(`${i + 1}.`))} ${chalk.bold(pattern.name)}
     ${chalk.gray('触发条件:')} ${pattern.trigger}
     ${chalk.gray('置信度:')}   ${confidenceBar}
     ${chalk.dim(pattern.evidence)}`);
    });
  }

  instincts(instincts) {
    console.log('\n');
    console.log(box('🧠 已生成的直觉', instincts.map((inst, i) =>
      `${chalk.yellow(`${i + 1}.`)} ${chalk.bold(inst.name)} ${chalk.gray(`(${Math.round(inst.confidence * 100)}%)`)}`
    ).join('\n')));
  }

  output(skillPath, instinctsPath) {
    console.log('\n');
    console.log(chalk.bold(chalk.green('✨ 生成完成!')));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`
  ${chalk.green('📄')} ${chalk.bold('技能文件:')}
     ${chalk.cyan(skillPath)}

  ${chalk.green('🧠')} ${chalk.bold('直觉文件:')}
     ${chalk.cyan(instinctsPath)}
`);
  }

  nextSteps() {
    console.log(box('📋 下一步', `
${chalk.yellow('1.')} 审查生成的 SKILL.md
${chalk.yellow('2.')} 导入直觉: ${chalk.cyan('/instinct-import <path>')}
${chalk.yellow('3.')} 查看已学习的模式: ${chalk.cyan('/instinct-status')}
${chalk.yellow('4.')} 演进为技能: ${chalk.cyan('/evolve')}
`));
    console.log('\n');
  }

  footer() {
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.dim(`  Powered by Everything Claude Code • ecc.tools`));
    console.log(chalk.dim(`  GitHub App: github.com/apps/skill-creator`));
    console.log('\n');
  }
}

// Demo function to show the output
async function demo() {
  const output = new SkillCreateOutput('PMX');

  output.header();

  await output.analyzePhase({
    commits: 200,
  });

  output.analysisResults({
    commits: 200,
    timeRange: '2024年11月 - 2025年1月',
    contributors: 4,
    files: 847,
  });

  output.patterns([
    {
      name: '约定式提交 (Conventional Commits)',
      trigger: '编写提交信息时',
      confidence: 0.85,
      evidence: '在 150/200 次提交中发现 (feat:, fix:, refactor:)',
    },
    {
      name: '客户端/服务端组件分离',
      trigger: '创建 Next.js 页面时',
      confidence: 0.90,
      evidence: '在 markets/, premarkets/, portfolio/ 中观察到',
    },
    {
      name: '服务层架构',
      trigger: '添加后端逻辑时',
      confidence: 0.85,
      evidence: '业务逻辑在 services/ 中，而非 routes/ 中',
    },
    {
      name: '带 E2E 测试的 TDD',
      trigger: '添加功能时',
      confidence: 0.75,
      evidence: '9 个 E2E 测试文件，常见 test(e2e) 提交',
    },
  ]);

  output.instincts([
    { name: 'pmx-conventional-commits', confidence: 0.85 },
    { name: 'pmx-client-component-pattern', confidence: 0.90 },
    { name: 'pmx-service-layer', confidence: 0.85 },
    { name: 'pmx-e2e-test-location', confidence: 0.90 },
    { name: 'pmx-package-manager', confidence: 0.95 },
    { name: 'pmx-hot-path-caution', confidence: 0.90 },
  ]);

  output.output(
    '.claude/skills/pmx-patterns/SKILL.md',
    '.claude/homunculus/instincts/inherited/pmx-instincts.yaml'
  );

  output.nextSteps();
  output.footer();
}

// Export for use in other scripts
module.exports = { SkillCreateOutput, demo };

// Run demo if executed directly
if (require.main === module) {
  demo().catch(console.error);
}
