# Claude Code 全方位速查指南

![页眉: Anthropic 黑客松获胜者 - Claude Code 技巧与窍门](./assets/images/shortform/00-header.png)

---

**自 2 月份实验性推出以来，我一直是 Claude Code 的忠实用户，并与 [@DRodriguezFX](https://x.com/DRodriguezFX) 一起赢得了 Anthropic x Forum Ventures 黑客松，我们的作品 [zenith.chat](https://zenith.chat) 完全使用 Claude Code 构建。**

这是我在日常使用 10 个月后的完整配置：技能、钩子、子代理、MCP、插件，以及真正行之有效的方法。

---

## 技能与命令 (Skills and Commands)

技能就像规则一样运行，但仅限于特定的范围和工作流。当你需要执行特定工作流时，它们是提示词的简写。

在使用 Opus 4.5 进行长时间编码会话后，你想清除死代码和散乱的 .md 文件吗？运行 `/refactor-clean`。需要测试？`/tdd`、`/e2e`、`/test-coverage`。技能还可以包含代码图谱 (codemaps)——这是 Claude 快速导航代码库的一种方式，无需在探索上浪费上下文。

![终端显示链式命令](./assets/images/shortform/02-chaining-commands.jpeg)
*将命令链接在一起*

命令是通过斜杠命令执行的技能。它们有重叠，但存储方式不同：

- **Skills (技能)**: `~/.claude/skills/` - 更广泛的工作流定义
- **Commands (命令)**: `~/.claude/commands/` - 快速可执行的提示词

```bash
# 技能结构示例
~/.claude/skills/
  pmx-guidelines.md      # 特定于项目的模式
  coding-standards.md    # 语言最佳实践
  tdd-workflow/          # 带有 README.md 的多文件技能
  security-review/       # 基于检查清单的技能
```

---

## 钩子 (Hooks)

钩子是基于触发器的自动化，会在特定事件发生时触发。与技能不同，它们仅限于工具调用和生命周期事件。

**钩子类型:**

1. **PreToolUse** - 工具执行前 (验证、提醒)
2. **PostToolUse** - 工具完成后 (格式化、反馈循环)
3. **UserPromptSubmit** - 当你发送消息时
4. **Stop** - 当 Claude 完成响应时
5. **PreCompact** - 上下文压缩前
6. **Notification** - 权限请求时

**示例: 长时间运行命令前的 tmux 提醒**

```json
{
  "PreToolUse": [
    {
      "matcher": "tool == \"Bash\" && tool_input.command matches \"(npm|pnpm|yarn|cargo|pytest)\"",
      "hooks": [
        {
          "type": "command",
          "command": "if [ -z \"$TMUX\" ]; then echo '[Hook] 建议使用 tmux 以保持会话持久性' >&2; fi"
        }
      ]
    }
  ]
}
```

![PostToolUse 钩子反馈](./assets/images/shortform/03-posttooluse-hook.png)
*运行 PostToolUse 钩子时你在 Claude Code 中得到的反馈示例*

**专业提示:** 使用 `hookify` 插件以对话方式创建钩子，而不是手动编写 JSON。运行 `/hookify` 并描述你想要的内容。

---

## 子代理 (Subagents)

子代理是你的编排者 (主 Claude) 可以委派任务的有限范围进程。它们可以在后台或前台运行，为主代理释放上下文。

子代理与技能配合得很好——一个能够执行你技能子集的子代理可以被委派任务并自主使用这些技能。它们还可以通过特定的工具权限进行沙盒化。

```bash
# 子代理结构示例
~/.claude/agents/
  planner.md           # 功能实现规划
  architect.md         # 系统设计决策
  tdd-guide.md         # 测试驱动开发
  code-reviewer.md     # 质量/安全审查
  security-reviewer.md # 漏洞分析
  build-error-resolver.md
  e2e-runner.md
  refactor-cleaner.md
```

为每个子代理配置允许的工具、MCP 和权限，以进行适当的范围限定。

---

## 规则与记忆 (Rules and Memory)

你的 `.rules` 文件夹保存着 Claude 应始终遵循的最佳实践的 `.md` 文件。两种方法：

1. **单个 CLAUDE.md** - 所有内容都在一个文件中 (用户或项目级别)
2. **规则文件夹** - 按关注点分组的模块化 `.md` 文件

```bash
~/.claude/rules/
  security.md      # 无硬编码密钥，验证输入
  coding-style.md  # 不可变性，文件组织
  testing.md       # TDD 工作流，80% 覆盖率
  git-workflow.md  # 提交格式，PR 流程
  agents.md        # 何时委派给子代理
  performance.md   # 模型选择，上下文管理
```

**规则示例:**

- 代码库中不使用 emoji
- 前端避免使用紫色色调
- 部署前始终测试代码
- 优先考虑模块化代码而非巨型文件
- 永远不要提交 console.logs

---

## MCP (模型上下文协议)

MCP 将 Claude 直接连接到外部服务。这不是 API 的替代品——它是围绕 API 的提示驱动包装器，允许在导航信息方面有更大的灵活性。

**示例:** Supabase MCP 让 Claude 提取特定数据，直接在上游运行 SQL，无需复制粘贴。数据库、部署平台等也是如此。

![Supabase MCP 列出表](./assets/images/shortform/04-supabase-mcp.jpeg)
*Supabase MCP 列出公共模式内表的示例*

**Chrome in Claude:** 是一个内置的插件 MCP，让 Claude 自主控制你的浏览器——点击查看事物的工作原理。

**关键: 上下文窗口管理**

对 MCP 要挑剔。我将所有 MCP 保存在用户配置中，但**禁用所有未使用的**。导航到 `/plugins` 并向下滚动或运行 `/mcp`。

![/plugins 界面](./assets/images/shortform/05-plugins-interface.jpeg)
*使用 /plugins 导航到 MCP 以查看当前安装的 MCP 及其状态*

启用太多工具后，压缩前的 200k 上下文窗口可能只有 70k。性能会显着下降。

**经验法则:** 在配置中保留 20-30 个 MCP，但保持启用少于 10 个 / 活跃工具少于 80 个。

```bash
# 检查启用的 MCP
/mcp

# 在 ~/.claude.json 的 projects.disabledMcpServers 下禁用未使用的 MCP
```

---

## 插件 (Plugins)

插件打包工具以便于安装，而不是繁琐的手动设置。插件可以是技能 + MCP 的组合，或者是捆绑在一起的钩子/工具。

**安装插件:**

```bash
# 添加市场
claude plugin marketplace add https://github.com/mixedbread-ai/mgrep

# 打开 Claude，运行 /plugins，找到新市场，从那里安装
```

![显示 mgrep 的市场选项卡](./assets/images/shortform/06-marketplaces-mgrep.jpeg)
*显示新安装的 Mixedbread-Grep 市场*

**LSP 插件** 如果你经常在编辑器之外运行 Claude Code，特别有用。语言服务器协议为 Claude 提供了实时类型检查、跳转到定义和智能补全，而无需打开 IDE。

```bash
# 启用的插件示例
typescript-lsp@claude-plugins-official  # TypeScript 智能
pyright-lsp@claude-plugins-official     # Python 类型检查
hookify@claude-plugins-official         # 以对话方式创建钩子
mgrep@Mixedbread-Grep                   # 比 ripgrep 更好的搜索
```

与 MCP 相同的警告——注意你的上下文窗口。

---

## 技巧与窍门 (Tips and Tricks)

### 键盘快捷键

- `Ctrl+U` - 删除整行 (比狂按退格键快)
- `!` - 快速 bash 命令前缀
- `@` - 搜索文件
- `/` - 启动斜杠命令
- `Shift+Enter` - 多行输入
- `Tab` - 切换思考显示
- `Esc Esc` - 中断 Claude / 恢复代码

### 并行工作流

- **Fork** (`/fork`) - 分叉对话以并行执行不重叠的任务，而不是滥用排队消息
- **Git Worktrees** - 用于重叠的并行 Claude 而不发生冲突。每个 worktree 是一个独立的检出

```bash
git worktree add ../feature-branch feature-branch
# 现在在每个 worktree 中运行单独的 Claude 实例
```

### 用于长时间运行命令的 tmux

流式传输并观看 Claude 运行的日志/bash 进程：

https://github.com/user-attachments/assets/shortform/07-tmux-video.mp4

```bash
tmux new -s dev
# Claude 在这里运行命令，你可以分离并重新连接
tmux attach -t dev
```

### mgrep > grep

`mgrep` 是对 ripgrep/grep 的重大改进。通过插件市场安装，然后使用 `/mgrep` 技能。适用于本地搜索和网络搜索。

```bash
mgrep "function handleSubmit"  # 本地搜索
mgrep --web "Next.js 15 app router changes"  # 网络搜索
```

### 其他有用的命令

- `/rewind` - 回退到先前的状态
- `/statusline` - 自定义分支、上下文百分比、待办事项
- `/checkpoints` - 文件级撤消点
- `/compact` - 手动触发上下文压缩

### GitHub Actions CI/CD

使用 GitHub Actions 在你的 PR 上设置代码审查。配置后，Claude 可以自动审查 PR。

![Claude 机器人批准 PR](./assets/images/shortform/08-github-pr-review.jpeg)
*Claude 批准错误修复 PR*

### 沙盒 (Sandboxing)

对有风险的操作使用沙盒模式 - Claude 在受限环境中运行，不会影响你的实际系统。

---

## 关于编辑器 (On Editors)

你的编辑器选择会显着影响 Claude Code 工作流。虽然 Claude Code 可以在任何终端运行，但将其与功能强大的编辑器配对可解锁实时文件跟踪、快速导航和集成命令执行。

### Zed (我的首选)

我使用 [Zed](https://zed.dev) - 用 Rust 编写，所以真的很快。瞬间打开，处理海量代码库毫无压力，而且几乎不占用系统资源。

**为什么 Zed + Claude Code 是绝佳组合:**

- **速度** - 基于 Rust 的性能意味着当 Claude 快速编辑文件时没有延迟。你的编辑器跟得上
- **Agent 面板集成** - Zed 的 Claude 集成让你在 Claude 编辑时实时跟踪文件更改。在 Claude 引用的文件之间跳转而无需离开编辑器
- **CMD+Shift+R 命令面板** - 在可搜索的 UI 中快速访问所有自定义斜杠命令、调试器、构建脚本
- **极少的资源使用** - 在繁重操作期间不会与 Claude 争夺 RAM/CPU。运行 Opus 时很重要
- **Vim 模式** - 如果你喜欢，提供完整的 vim 键绑定

![带有自定义命令的 Zed 编辑器](./assets/images/shortform/09-zed-editor.jpeg)
*使用 CMD+Shift+R 显示自定义命令下拉菜单的 Zed 编辑器。跟随模式显示为右下角的靶心。*

**通用的编辑器提示:**

1. **分屏** - 一侧是带有 Claude Code 的终端，另一侧是编辑器
2. **Ctrl + G** - 快速在 Zed 中打开 Claude 当前正在处理的文件
3. **自动保存** - 启用自动保存，以便 Claude 的文件读取始终是最新的
4. **Git 集成** - 在提交之前使用编辑器的 git 功能审查 Claude 的更改
5. **文件监视器** - 大多数编辑器会自动重新加载更改的文件，请确认已启用此功能

### VSCode / Cursor

这也是一个可行的选择，并且与 Claude Code 配合良好。你可以以任何终端格式使用它，使用 `\ide` 启用 LSP 功能（现在与插件有些多余）与编辑器自动同步。或者你可以选择扩展，它与编辑器集成更紧密并具有匹配的 UI。

![VS Code Claude Code 扩展](./assets/images/shortform/10-vscode-extension.jpeg)
*VS Code 扩展为 Claude Code 提供了原生图形界面，直接集成到你的 IDE 中。*

---

## 我的配置 (My Setup)

### 插件

**已安装:** (我通常一次只启用其中的 4-5 个)

```markdown
ralph-wiggum@claude-code-plugins       # 循环自动化
frontend-design@claude-code-plugins    # UI/UX 模式
commit-commands@claude-code-plugins    # Git 工作流
security-guidance@claude-code-plugins  # 安全检查
pr-review-toolkit@claude-code-plugins  # PR 自动化
typescript-lsp@claude-plugins-official # TS 智能
hookify@claude-plugins-official        # 钩子创建
code-simplifier@claude-plugins-official
feature-dev@claude-code-plugins
explanatory-output-style@claude-code-plugins
code-review@claude-code-plugins
context7@claude-plugins-official       # 实时文档
pyright-lsp@claude-plugins-official    # Python 类型
mgrep@Mixedbread-Grep                  # 更好的搜索
```

### MCP 服务器

**已配置 (用户级别):**

```json
{
  "github": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"] },
  "firecrawl": { "command": "npx", "args": ["-y", "firecrawl-mcp"] },
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=YOUR_REF"]
  },
  "memory": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-memory"] },
  "sequential-thinking": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  },
  "vercel": { "type": "http", "url": "https://mcp.vercel.com" },
  "railway": { "command": "npx", "args": ["-y", "@railway/mcp-server"] },
  "cloudflare-docs": { "type": "http", "url": "https://docs.mcp.cloudflare.com/mcp" },
  "cloudflare-workers-bindings": {
    "type": "http",
    "url": "https://bindings.mcp.cloudflare.com/mcp"
  },
  "clickhouse": { "type": "http", "url": "https://mcp.clickhouse.cloud/mcp" },
  "AbletonMCP": { "command": "uvx", "args": ["ableton-mcp"] },
  "magic": { "command": "npx", "args": ["-y", "@magicuidesign/mcp@latest"] }
}
```

这是关键——我配置了 14 个 MCP，但每个项目只启用约 5-6 个。保持上下文窗口健康。

### 关键钩子

```json
{
  "PreToolUse": [
    { "matcher": "npm|pnpm|yarn|cargo|pytest", "hooks": ["tmux reminder"] },
    { "matcher": "Write && .md file", "hooks": ["block unless README/CLAUDE"] },
    { "matcher": "git push", "hooks": ["open editor for review"] }
  ],
  "PostToolUse": [
    { "matcher": "Edit && .ts/.tsx/.js/.jsx", "hooks": ["prettier --write"] },
    { "matcher": "Edit && .ts/.tsx", "hooks": ["tsc --noEmit"] },
    { "matcher": "Edit", "hooks": ["grep console.log warning"] }
  ],
  "Stop": [
    { "matcher": "*", "hooks": ["check modified files for console.log"] }
  ]
}
```

### 自定义状态栏

显示用户、目录、带有未提交指示的 git 分支、剩余上下文 %、模型、时间和待办事项计数：

![自定义状态栏](./assets/images/shortform/11-statusline.jpeg)
*我的 Mac 根目录下的状态栏示例*

```
affoon:~ ctx:65% Opus 4.5 19:52
▌▌ plan mode on (shift+tab to cycle)
```

### 规则结构

```
~/.claude/rules/
  security.md      # 强制性安全检查
  coding-style.md  # 不可变性，文件大小限制
  testing.md       # TDD，80% 覆盖率
  git-workflow.md  # 约定式提交
  agents.md        # 子代理委派规则
  patterns.md      # API 响应格式
  performance.md   # 模型选择 (Haiku vs Sonnet vs Opus)
  hooks.md         # 钩子文档
```

### 子代理

```
~/.claude/agents/
  planner.md           # 分解功能
  architect.md         # 系统设计
  tdd-guide.md         # 先写测试
  code-reviewer.md     # 质量审查
  security-reviewer.md # 漏洞扫描
  build-error-resolver.md
  e2e-runner.md        # Playwright 测试
  refactor-cleaner.md  # 死代码移除
  doc-updater.md       # 保持文档同步
```

---

## 关键要点 (Key Takeaways)

1. **不要过度复杂化** - 将配置视为微调，而不是架构
2. **上下文窗口很宝贵** - 禁用未使用的 MCP 和插件
3. **并行执行** - 分叉对话，使用 git worktrees
4. **自动化重复工作** - 用于格式化、linting、提醒的钩子
5. **限定子代理范围** - 有限的工具 = 专注的执行

---

## 参考资料 (References)

- [Plugins Reference (插件参考)](https://code.claude.com/docs/en/plugins-reference)
- [Hooks Documentation (钩子文档)](https://code.claude.com/docs/en/hooks)
- [Checkpointing (检查点)](https://code.claude.com/docs/en/checkpointing)
- [Interactive Mode (交互模式)](https://code.claude.com/docs/en/interactive-mode)
- [Memory System (记忆系统)](https://code.claude.com/docs/en/memory)
- [Subagents (子代理)](https://code.claude.com/docs/en/sub-agents)
- [MCP Overview (MCP 概述)](https://code.claude.com/docs/en/mcp-overview)

---

**注意:** 这是细节的子集。有关高级模式，请参阅 [长篇指南](./the-longform-guide.md)。

---

*与 [@DRodriguezFX](https://x.com/DRodriguezFX) 一起在纽约构建 [zenith.chat](https://zenith.chat) 赢得 Anthropic x Forum Ventures 黑客松*
