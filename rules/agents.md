# Agent 编排 (Agent Orchestration)

## 可用 Agent (Available Agents)

位于 `~/.claude/agents/`:

| Agent | 用途 | 何时使用 |
|-------|---------|-------------|
| planner | 实现规划 | 复杂功能、重构 |
| architect | 系统设计 | 架构决策 |
| tdd-guide | 测试驱动开发 | 新功能、Bug 修复 |
| code-reviewer | 代码审查 | 编写代码后 |
| security-reviewer | 安全分析 | 提交前 |
| build-error-resolver | 修复构建错误 | 构建失败时 |
| e2e-runner | E2E 测试 | 关键用户流程 |
| refactor-cleaner | 死代码清理 | 代码维护 |
| doc-updater | 文档 | 更新文档 |

## 立即使用的 Agent (Immediate Agent Usage)

无需用户提示：
1. 复杂功能请求 - 使用 **planner** agent
2. 刚刚编写/修改了代码 - 使用 **code-reviewer** agent
3. Bug 修复或新功能 - 使用 **tdd-guide** agent
4. 架构决策 - 使用 **architect** agent

## 并行任务执行 (Parallel Task Execution)

对于独立的操作，**始终**使用并行 Task 执行：

```markdown
# GOOD: 并行执行
并行启动 3 个 agent：
1. Agent 1: auth.ts 的安全分析
2. Agent 2: 缓存系统的性能审查
3. Agent 3: utils.ts 的类型检查

# BAD: 不必要的顺序执行
先 agent 1，然后 agent 2，然后 agent 3
```

## 多视角分析 (Multi-Perspective Analysis)

对于复杂问题，使用分角色的子 agent：
- 事实审查员 (Factual reviewer)
- 高级工程师 (Senior engineer)
- 安全专家 (Security expert)
- 一致性审查员 (Consistency reviewer)
- 冗余检查员 (Redundancy checker)
