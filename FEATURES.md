# 🌟 功能介绍 (Feature Guide)

本文档详细介绍了本仓库包含的各个模块及其核心作用。

## 1. 🤖 子代理 (Agents)
**位置**: `agents/`

专门用于特定复杂任务的 AI 角色。通过 `/plan` 等指令调用。

| 代理名称 | 文件 | 作用 |
| :--- | :--- | :--- |
| **Planner** | `planner.md` | **规划师**：拆解任务，生成实施计划 (`plan.md`) |
| **Architect** | `architect.md` | **架构师**：做系统设计决策，画图 |
| **Code Reviewer** | `code-reviewer.md` | **审查员**：检查代码质量、风格一致性 |
| **Security Reviewer** | `security-reviewer.md` | **安全审计**：专门寻找漏洞 (OWASP Top 10) |
| **TDD Guide** | `tdd-guide.md` | **测试向导**：指导测试驱动开发流程 |
| **Build Error Resolver** | `build-error-resolver.md` | **构建修复**：分析编译错误并提出修复方案 |
| **Refactor Cleaner** | `refactor-cleaner.md` | **清理工**：移除死代码、无用变量 |
| **Doc Updater** | `doc-updater.md` | **文档同步**：代码变更后自动更新文档 |

---

## 2. 🧠 技能 (Skills)
**位置**: `skills/`

预定义的工作流步骤和领域知识库。Claude 会根据上下文自动检索这些知识。

| 技能类别 | 包含内容 | 作用 |
| :--- | :--- | :--- |
| **TDD Workflow** | `tdd-workflow/` | 标准测试驱动开发流程 (红-绿-重构) |
| **Security Review** | `security-review/` | 安全检查清单 (注入、XSS、敏感数据) |
| **Coding Standards** | `coding-standards/` | 代码风格规范 (不可变性、函数式优先) |
| **Continuous Learning** | `continuous-learning/` | **持续学习系统**：从会话中自动提取新模式 |
| **Strategic Compact** | `strategic-compact/` | **上下文压缩策略**：智能决定何时压缩记忆 |
| **Verification Loop** | `verification-loop/` | **验证闭环**：不仅仅是写完，还要验证是否能跑通 |
| **Go/Python Patterns** | `golang-patterns/`等 | 特定语言的最佳实践与惯用法 |

---

## 3. 🛡️ 规则 (Rules)
**位置**: `rules/`

必须遵守的硬性准则。通常复制到 `~/.claude/rules/` 作为全局守护。

| 规则文件 | 核心内容 |
| :--- | :--- |
| `security.md` | **安全红线**：禁止硬编码密钥、禁止执行未验证代码 |
| `coding-style.md` | **风格指南**：文件行数限制、命名规范、模块化要求 |
| `testing.md` | **测试要求**：新功能必须有测试、覆盖率底线 |
| `git-workflow.md` | **Git 规范**：Commit Message 格式、分支管理策略 |
| `agents.md` | **代理调用**：何时应该委派给子代理而不是自己蛮干 |

---

## 4. ⚡ 指令 (Commands)
**位置**: `commands/`

快速触发复杂操作的快捷键。

| 指令 | 对应文件 | 作用 |
| :--- | :--- | :--- |
| `/plan` | `plan.md` | 启动规划流程 (调用 Planner Agent) |
| `/verify` | `verify.md` | 执行验证循环 (运行测试 + 检查输出) |
| `/tdd` | `tdd.md` | 启动 TDD 模式 |
| `/checkpoint` | `checkpoint.md` | 创建当前进度的检查点 (保存状态) |
| `/learn` | `learn.md` | 触发学习机制，总结当前会话经验 |
| `/refactor-clean` | `refactor-clean.md` | 启动代码清理任务 |
| `/sessions` | `sessions.md` | **会话管理**：列出、加载、别名管理历史会话 |

---

## 5. 🔌 钩子 (Hooks) & 脚本 (Scripts)
**位置**: `hooks/` & `scripts/`

幕后英雄，负责自动化和记忆管理。

*   **Session Start**: 会话开始时自动加载上一次的 `memory.md`。
*   **Session End**: 会话结束时自动总结并保存 `memory.md`。
*   **Pre-Compact**: 在上下文快满时，抢先保存关键信息。
*   **Tool Use**: 监控工具使用，拦截高风险操作 (如 `rm -rf /`)。

---

## 6. 🎭 上下文模式 (Contexts) - *Advanced*
**位置**: `contexts/`

通过 CLI 参数注入的系统级人设。

*   `dev.md`: **开发模式** (高效、少话)
*   `review.md`: **审查模式** (严格、多疑)
*   `research.md`: **研究模式** (深度、详尽)
