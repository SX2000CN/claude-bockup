# 编排命令 (Orchestrate Command)

用于复杂任务的顺序 Agent 工作流。

## 用法 (Usage)

`/orchestrate [workflow-type] [task-description]`

## 工作流类型 (Workflow Types)

### feature (功能)
完整的功能实现工作流：
```
planner -> tdd-guide -> code-reviewer -> security-reviewer
```

### bugfix (修复)
Bug 调查和修复工作流：
```
explorer -> tdd-guide -> code-reviewer
```

### refactor (重构)
安全重构工作流：
```
architect -> code-reviewer -> tdd-guide
```

### security (安全)
以安全为重点的审查：
```
security-reviewer -> code-reviewer -> architect
```

## 执行模式 (Execution Pattern)

对于工作流中的每个 Agent：

1. **调用 Agent**：带有来自上一个 Agent 的上下文
2. **收集输出**：作为结构化的交接文档
3. **传递给链中的下一个 Agent**
4. **聚合结果**：进入最终报告

## 交接文档格式 (Handoff Document Format)

在 Agent 之间，创建交接文档：

```markdown
## HANDOFF: [previous-agent] -> [next-agent]

### Context (上下文)
[Summary of what was done]

### Findings (发现)
[Key discoveries or decisions]

### Files Modified (修改的文件)
[List of files touched]

### Open Questions (未决问题)
[Unresolved items for next agent]

### Recommendations (建议)
[Suggested next steps]
```

## 示例：功能工作流 (Example: Feature Workflow)

```
/orchestrate feature "Add user authentication"
```

执行过程：

1. **Planner Agent**
   - 分析需求
   - 创建实施计划
   - 识别依赖关系
   - 输出: `HANDOFF: planner -> tdd-guide`

2. **TDD Guide Agent**
   - 读取 Planner 交接文档
   - 先写测试
   - 实现以通过测试
   - 输出: `HANDOFF: tdd-guide -> code-reviewer`

3. **Code Reviewer Agent**
   - 审查实现
   - 检查问题
   - 建议改进
   - 输出: `HANDOFF: code-reviewer -> security-reviewer`

4. **Security Reviewer Agent**
   - 安全审计
   - 漏洞检查
   - 最终批准
   - 输出: 最终报告

## 最终报告格式 (Final Report Format)

```
ORCHESTRATION REPORT
====================
Workflow: feature
Task: Add user authentication
Agents: planner -> tdd-guide -> code-reviewer -> security-reviewer

SUMMARY
-------
[一段话摘要]

AGENT OUTPUTS
-------------
Planner: [摘要]
TDD Guide: [摘要]
Code Reviewer: [摘要]
Security Reviewer: [摘要]

FILES CHANGED
-------------
[列出所有修改的文件]

TEST RESULTS
------------
[测试通过/失败摘要]

SECURITY STATUS
---------------
[安全发现]

RECOMMENDATION
--------------
[SHIP / NEEDS WORK / BLOCKED]
```

## 并行执行 (Parallel Execution)

对于独立检查，并行运行 Agent：

```markdown
### Parallel Phase
Run simultaneously:
- code-reviewer (质量)
- security-reviewer (安全)
- architect (设计)

### Merge Results
Combine outputs into single report
```

## 参数 (Arguments)

$ARGUMENTS:
- `feature <description>` - 完整功能工作流
- `bugfix <description>` - Bug 修复工作流
- `refactor <description>` - 重构工作流
- `security <description>` - 安全审查工作流
- `custom <agents> <description>` - 自定义 Agent 序列

## 自定义工作流示例 (Custom Workflow Example)

```
/orchestrate custom "architect,tdd-guide,code-reviewer" "Redesign caching layer"
```

## 提示 (Tips)

1. **从 Planner 开始**：对于复杂功能
2. **始终包含 Code Reviewer**：在合并之前
3. **使用 Security Reviewer**：对于 认证/支付/PII
4. **保持交接简洁**：专注于下一个 Agent 需要什么
5. **运行验证**：如果在 Agent 之间需要
