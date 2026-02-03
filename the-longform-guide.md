# Claude Code 全方位长篇指南

![页眉: Claude Code 全方位长篇指南](./assets/images/longform/01-header.png)

---

> **先决条件**: 本指南建立在 [Claude Code 全方位速查指南](./the-shortform-guide.md) 的基础之上。如果你还没有设置技能、钩子、子代理、MCP 和插件，请先阅读那篇文章。

![速查指南参考](./assets/images/longform/02-shortform-reference.png)
*速查指南 - 请先阅读*

在速查指南中，我介绍了基础设置：技能和命令、钩子、子代理、MCP、插件，以及构成高效 Claude Code 工作流骨干的配置模式。那是安装指南和基础架构。

这篇长篇指南将深入探讨区分高效会话与浪费会话的技术。如果你还没读过速查指南，请回去先设置好你的配置。接下来的内容假设你已经配置好了技能、代理、钩子和 MCP 并能正常工作。

这里的主题包括：代币经济学、记忆持久化、验证模式、并行化策略，以及构建可重用工作流的复利效应。这些是我在 10 多个月的日常使用中提炼出的模式，它们决定了你是从第一个小时就被上下文腐烂所困扰，还是能保持数小时的高效会话。

速查指南和长篇指南中涵盖的所有内容都可以在 GitHub 上找到：`github.com/affaan-m/everything-claude-code`

---

## 技巧与窍门 (Tips and Tricks)

### 某些 MCP 是可替换的，这将释放你的上下文窗口

对于像版本控制 (GitHub)、数据库 (Supabase)、部署 (Vercel, Railway) 等 MCP——这些平台大多数都已经有了强大的 CLI，MCP 本质上只是对其进行了包装。MCP 是一个很好的包装器，但它是有代价的。

为了让 CLI 的功能更像 MCP，但又不实际使用 MCP（以及随之而来的上下文窗口减少），可以考虑将功能捆绑到技能和命令中。剥离 MCP 暴露的那些让事情变得简单的工具，并将它们转化为命令。

例如：不要一直加载 GitHub MCP，而是创建一个 `/gh-pr` 命令，用你偏好的选项包装 `gh pr create`。不要让 Supabase MCP 吞噬上下文，而是创建直接使用 Supabase CLI 的技能。

通过延迟加载，上下文窗口问题大部分得到了解决。但代币使用和成本并没有以同样的方式解决。CLI + 技能的方法仍然是一种代币优化方法。

---

## 重要事项 (IMPORTANT STUFF)

### 上下文和记忆管理 (Context and Memory Management)

为了在会话之间共享记忆，最好的办法是使用一个技能或命令来总结和检查进度，然后将其保存到 `.claude` 文件夹中的 `.tmp` 文件中，并追加内容直到会话结束。第二天，它可以利用该文件作为上下文，从你停下的地方继续，为每个会话创建一个新文件，这样你就不会把旧的上下文污染到新工作中。

![会话存储文件树](./assets/images/longform/03-session-storage.png)
*会话存储示例 -> https://github.com/affaan-m/everything-claude-code/tree/main/examples/sessions*

Claude 创建一个文件总结当前状态。审查它，如果需要则要求修改，然后重新开始。对于新的对话，只需提供文件路径即可。当你遇到上下文限制并需要继续复杂工作时特别有用。这些文件应包含：
- 哪些方法奏效了（有证据核实）
- 尝试了哪些方法但没有奏效
- 哪些方法尚未尝试，还剩下什么要做

**战略性清除上下文:**

一旦你制定了计划并清除了上下文（现在 Claude Code 计划模式中的默认选项），你就可以按照计划工作了。当你积累了大量与执行不再相关的探索上下文时，这很有用。对于战略性压缩，请禁用自动压缩。在逻辑间隔手动压缩或创建一个为你执行此操作的技能。

**进阶：动态系统提示注入**

我学到的一个模式：不要只把所有东西都放在加载到每个会话的 CLAUDE.md (用户范围) 或 `.claude/rules/` (项目范围) 中，而是使用 CLI 标志动态注入上下文。

```bash
claude --system-prompt "$(cat memory.md)"
```

这让你能更精确地控制何时加载什么上下文。系统提示内容具有比用户消息更高的权威性，而用户消息又比工具结果具有更高的权威性。

**实用设置:**

```bash
# 日常开发
alias claude-dev='claude --system-prompt "$(cat ~/.claude/contexts/dev.md)"'

# PR 审查模式
alias claude-review='claude --system-prompt "$(cat ~/.claude/contexts/review.md)"'

# 研究/探索模式
alias claude-research='claude --system-prompt "$(cat ~/.claude/contexts/research.md)"'
```

**进阶：记忆持久化钩子**

有一些大多数人不知道的钩子可以帮助记忆：

- **PreCompact Hook**: 在上下文压缩发生之前，将重要状态保存到文件
- **Stop Hook (Session End)**: 在会话结束时，将学到的知识持久化到文件
- **SessionStart Hook**: 在新会话开始时，自动加载之前的上下文

我已经构建了这些钩子，它们在仓库中的位置是 `github.com/affaan-m/everything-claude-code/tree/main/hooks/memory-persistence`

---

### 持续学习 / 记忆 (Continuous Learning / Memory)

如果你不得不重复同一个提示多次，而 Claude 遇到了同样的问题或给出了你以前听过的回复——这些模式必须被追加到技能中。

**问题:** 浪费代币，浪费上下文，浪费时间。

**解决方案:** 当 Claude Code 发现了一些非琐碎的东西——一种调试技术、一个变通方法、一些特定于项目的模式——它会将该知识保存为一项新技能。下次出现类似问题时，该技能会自动加载。

我构建了一个执行此操作的持续学习技能：`github.com/affaan-m/everything-claude-code/tree/main/skills/continuous-learning`

**为什么是 Stop Hook (而不是 UserPromptSubmit):**

关键的设计决策是使用 **Stop hook** 而不是 UserPromptSubmit。UserPromptSubmit 在每条消息上都会运行——给每个提示增加延迟。Stop 在会话结束时运行一次——轻量级，不会在会话期间拖慢你的速度。

---

### 代币优化 (Token Optimization)

**主要策略：子代理架构**

优化你使用的工具和子代理架构，旨在委派足以完成任务的最便宜的模型。

**模型选择快速参考:**

![模型选择表](./assets/images/longform/04-model-selection.png)
*各种常见任务上的子代理假设设置及其选择背后的理由*

| 任务类型 | 模型 | 原因 |
| --- | --- | --- |
| 探索/搜索 | Haiku | 快速，便宜，足以查找文件 |
| 简单编辑 | Haiku | 单文件更改，指令清晰 |
| 多文件实现 | Sonnet | 编码的最佳平衡点 |
| 复杂架构 | Opus | 需要深度推理 |
| PR 审查 | Sonnet | 理解上下文，捕捉细微差别 |
| 安全分析 | Opus | 经不起遗漏漏洞的风险 |
| 编写文档 | Haiku | 结构简单 |
| 调试复杂 Bug | Opus | 需要在脑海中构建整个系统 |

对于 90% 的编码任务，默认使用 Sonnet。当第一次尝试失败、任务跨越 5 个以上文件、涉及架构决策或安全关键代码时，升级到 Opus。

**定价参考:**

![Claude 模型定价](./assets/images/longform/05-pricing-table.png)
*来源: https://platform.claude.com/docs/en/about-claude/pricing*

**特定工具的优化:**

用 mgrep 替换 grep——与传统的 grep 或 ripgrep 相比，平均减少约 50% 的代币：

![mgrep 基准测试](./assets/images/longform/06-mgrep-benchmark.png)
*在我们的 50 项任务基准测试中，mgrep + Claude Code 使用的代币比基于 grep 的工作流少约 2 倍，且判断质量相似或更好。来源: https://github.com/mixedbread-ai/mgrep*

**模块化代码库的好处:**

拥有一个更模块化的代码库，主要文件只有几百行而不是几千行，这既有助于降低代币优化成本，也有助于在第一次尝试时就正确完成任务。

---

### 验证循环和评估 (Verification Loops and Evals)

**基准测试工作流:**

比较在使用和不使用技能的情况下请求相同内容，并检查输出差异：

Fork 对话，在其中一个中启动一个新的 worktree 而不使用该技能，最后提取 diff，查看记录了什么。

**评估模式类型:**

- **基于检查点的评估**: 设置明确的检查点，根据定义的标准进行验证，在继续之前修复
- **持续评估**: 每 N 分钟或在重大更改后运行，全套测试套件 + lint

**关键指标:**

```
pass@k: k 次尝试中至少有一次成功
        k=1: 70%  k=3: 91%  k=5: 97%

pass^k: 所有 k 次尝试必须都成功
        k=1: 70%  k=3: 34%  k=5: 17%
```

当你只需要它能工作时使用 **pass@k**。当一致性至关重要时使用 **pass^k**。

---

## 并行化 (PARALLELIZATION)

当在多 Claude 终端设置中 fork 对话时，确保 fork 中的操作和原始对话的范围定义明确。在涉及代码更改时，尽量减少重叠。

**我偏好的模式:**

主聊天用于代码更改，fork 用于询问关于代码库及其当前状态的问题，或对外部服务进行研究。

**关于任意终端数量:**

![Boris 关于并行终端](./assets/images/longform/07-boris-parallel.png)
*Boris (Anthropic) 关于运行多个 Claude 实例的建议*

Boris 有关于并行化的建议。他建议在本地运行 5 个 Claude 实例，在上游运行 5 个。我建议不要设置任意数量的终端。增加终端应该是出于真正的必要。

你的目标应该是：**以最小的可行并行量能完成多少工作。**

**用于并行实例的 Git Worktrees:**

```bash
# 为并行工作创建 worktrees
git worktree add ../project-feature-a feature-a
git worktree add ../project-feature-b feature-b
git worktree add ../project-refactor refactor-branch

# 每个 worktree 都有自己的 Claude 实例
cd ../project-feature-a && claude
```

如果你开始扩展你的实例，并且你有多个 Claude 实例在处理彼此重叠的代码，那么你必须使用 git worktrees 并为每个实例制定非常明确的计划。使用 `/rename <此处名称>` 来命名你所有的聊天。

![双终端设置](./assets/images/longform/08-two-terminals.png)
*初始设置：左终端用于编码，右终端用于提问 - 使用 /rename 和 /fork*

**瀑布流方法 (The Cascade Method):**

当运行多个 Claude Code 实例时，以“瀑布”模式组织：

- 在右侧的新标签页中打开新任务
- 从左到右扫描，从最旧到最新
- 一次最多关注 3-4 个任务

---

## 基础工作 (GROUNDWORK)

**双实例启动模式:**

对于我自己的工作流管理，我喜欢用 2 个打开的 Claude 实例启动一个空仓库。

**实例 1: 脚手架代理 (Scaffolding Agent)**
- 铺设脚手架和基础工作
- 创建项目结构
- 设置配置 (CLAUDE.md, rules, agents)

**实例 2: 深度研究代理 (Deep Research Agent)**
- 连接到你所有的服务，网络搜索
- 创建详细的 PRD
- 创建架构 mermaid 图
- 汇编带有实际文档片段的参考资料

**llms.txt 模式:**

如果可用，你可以通过在文档页面上执行 `/llms.txt` 在许多文档参考中找到 `llms.txt`。这为你提供了一个干净的、LLM 优化的文档版本。

**理念：构建可重用模式**

来自 @omarsar0: “在早期，我花时间构建可重用的工作流/模式。构建起来很繁琐，但随着模型和代理工具的改进，这产生了巨大的复利效应。”

**值得投资的方面:**

- 子代理
- 技能
- 命令
- 规划模式
- MCP 工具
- 上下文工程模式

---

## 代理和子代理的最佳实践 (Best Practices for Agents & Sub-Agents)

**子代理上下文问题:**

子代理的存在是为了通过返回摘要而不是转储所有内容来节省上下文。但是编排者拥有子代理所缺乏的语义上下文。子代理只知道字面查询，不知道请求背后的目的。

**迭代检索模式:**

1. 编排者评估每个子代理的返回
2. 在接受之前提出后续问题
3. 子代理回到源头，获取答案，返回
4. 循环直到满足要求（最多 3 个周期）

**关键:** 传递目标上下文，而不仅仅是查询。

**具有顺序阶段的编排者:**

```markdown
阶段 1: 研究 (使用 Explore 代理) → research-summary.md
阶段 2: 计划 (使用 planner 代理) → plan.md
阶段 3: 实现 (使用 tdd-guide 代理) → code changes
阶段 4: 审查 (使用 code-reviewer 代理) → review-comments.md
阶段 5: 验证 (如果需要使用 build-error-resolver) → 完成或循环回退
```

**关键规则:**

1. 每个代理获得一个清晰的输入并产生一个清晰的输出
2. 输出成为下一阶段的输入
3. 永远不要跳过阶段
4. 在代理之间使用 `/clear`
5. 将中间输出存储在文件中

---

## 有趣的东西 / 非关键但有趣的提示

### 自定义状态栏

你可以使用 `/statusline` 设置它——然后 Claude 会说你没有设置，但可以为你设置，并问你想要在里面放什么。

参见: https://github.com/sirmalloc/ccstatusline

### 语音转录

用你的声音与 Claude Code 交谈。对许多人来说比打字快。

- Mac 上的 superwhisper, MacWhisper
- 即使有转录错误，Claude 也能理解意图

### 终端别名

```bash
alias c='claude'
alias gb='github'
alias co='code'
alias q='cd ~/Desktop/projects'
```

---

## 里程碑 (Milestone)

![25k+ GitHub Stars](./assets/images/longform/09-25k-stars.png)
*不到一周内获得 25,000+ GitHub stars*

---

## 资源 (Resources)

**代理编排:**

- https://github.com/ruvnet/claude-flow - 拥有 54+ 专业代理的企业级编排平台

**自我改进的记忆:**

- https://github.com/affaan-m/everything-claude-code/tree/main/skills/continuous-learning
- rlancemartin.github.io/2025/12/01/claude_diary/ - 会话反思模式

**系统提示参考:**

- https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools - 系统提示合集 (110k stars)

**官方:**

- Anthropic Academy: anthropic.skilljar.com

---

## 参考资料 (References)

- [Anthropic: 揭秘 AI 代理的评估](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [YK: 32 个 Claude Code 技巧](https://agenticcoding.substack.com/p/32-claude-code-tips-from-basics-to)
- [RLanceMartin: 会话反思模式](https://rlancemartin.github.io/2025/12/01/claude_diary/)
- @PerceptualPeak: 子代理上下文协商
- @menhguin: 代理抽象层级列表
- @omarsar0: 复利效应哲学

---

*两个指南中涵盖的所有内容都可以在 GitHub 上的 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 找到*
