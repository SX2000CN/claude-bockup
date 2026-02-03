---
name: eval-harness
description: Claude Code 会话的正式评估框架，实现评估驱动开发 (EDD) 原则
tools: Read, Write, Edit, Bash, Grep, Glob
---

# 评估工具技能 (Eval Harness Skill)

Claude Code 会话的正式评估框架，实现评估驱动开发 (Eval-Driven Development, EDD) 原则。

## 哲学 (Philosophy)

评估驱动开发将评估视为 "AI 开发的单元测试"：
- 在实现之前定义预期行为
- 在开发过程中持续运行评估
- 跟踪每次更改的回归情况
- 使用 pass@k 指标进行可靠性测量

## 评估类型 (Eval Types)

### 能力评估 (Capability Evals)
测试 Claude 是否能做之前做不到的事情：
```markdown
[CAPABILITY EVAL: feature-name]
Task: Description of what Claude should accomplish
Success Criteria:
  - [ ] Criterion 1
  - [ ] Criterion 2
  - [ ] Criterion 3
Expected Output: Description of expected result
```

### 回归评估 (Regression Evals)
确保更改不会破坏现有功能：
```markdown
[REGRESSION EVAL: feature-name]
Baseline: SHA or checkpoint name
Tests:
  - existing-test-1: PASS/FAIL
  - existing-test-2: PASS/FAIL
  - existing-test-3: PASS/FAIL
Result: X/Y passed (previously Y/Y)
```

## 评分器类型 (Grader Types)

### 1. 基于代码的评分器 (Code-Based Grader)
使用代码进行的确定性检查：
```bash
# 检查文件是否包含预期模式
grep -q "export function handleAuth" src/auth.ts && echo "PASS" || echo "FAIL"

# 检查测试是否通过
npm test -- --testPathPattern="auth" && echo "PASS" || echo "FAIL"

# 检查构建是否成功
npm run build && echo "PASS" || echo "FAIL"
```

### 2. 基于模型的评分器 (Model-Based Grader)
使用 Claude 评估开放式输出：
```markdown
[MODEL GRADER PROMPT]
Evaluate the following code change:
1. Does it solve the stated problem?
2. Is it well-structured?
3. Are edge cases handled?
4. Is error handling appropriate?

Score: 1-5 (1=poor, 5=excellent)
Reasoning: [explanation]
```

### 3. 人类评分器 (Human Grader)
标记以供人工审查：
```markdown
[HUMAN REVIEW REQUIRED]
Change: Description of what changed
Reason: Why human review is needed
Risk Level: LOW/MEDIUM/HIGH
```

## 指标 (Metrics)

### pass@k
"k 次尝试中至少有一次成功"
- pass@1: 第一次尝试成功率
- pass@3: 3 次尝试内成功
- 典型目标: pass@3 > 90%

### pass^k
"所有 k 次试验均成功"
- 更高的可靠性标准
- pass^3: 连续 3 次成功
- 用于关键路径

## 评估工作流 (Eval Workflow)

### 1. 定义 (编码前) (Define)
```markdown
## EVAL DEFINITION: feature-xyz

### Capability Evals
1. Can create new user account
2. Can validate email format
3. Can hash password securely

### Regression Evals
1. Existing login still works
2. Session management unchanged
3. Logout flow intact

### Success Metrics
- pass@3 > 90% for capability evals
- pass^3 = 100% for regression evals
```

### 2. 实现 (Implement)
编写代码以通过定义的评估。

### 3. 评估 (Evaluate)
```bash
# 运行能力评估
[Run each capability eval, record PASS/FAIL]

# 运行回归评估
npm test -- --testPathPattern="existing"

# 生成报告
```

### 4. 报告 (Report)
```markdown
EVAL REPORT: feature-xyz
========================

Capability Evals:
  create-user:     PASS (pass@1)
  validate-email:  PASS (pass@2)
  hash-password:   PASS (pass@1)
  Overall:         3/3 passed

Regression Evals:
  login-flow:      PASS
  session-mgmt:    PASS
  logout-flow:     PASS
  Overall:         3/3 passed

Metrics:
  pass@1: 67% (2/3)
  pass@3: 100% (3/3)

Status: READY FOR REVIEW
```

## 集成模式 (Integration Patterns)

### 实现前 (Pre-Implementation)
```
/eval define feature-name
```
在 `.claude/evals/feature-name.md` 创建评估定义文件

### 实现期间 (During Implementation)
```
/eval check feature-name
```
运行当前评估并报告状态

### 实现后 (Post-Implementation)
```
/eval report feature-name
```
生成完整的评估报告

## 评估存储 (Eval Storage)

在项目中存储评估：
```
.claude/
  evals/
    feature-xyz.md      # 评估定义
    feature-xyz.log     # 评估运行历史
    baseline.json       # 回归基线
```

## 最佳实践 (Best Practices)

1. **编码前定义评估** - 强制清晰地思考成功标准
2. **频繁运行评估** - 尽早发现回归
3. **随时间跟踪 pass@k** - 监控可靠性趋势
4. **尽可能使用代码评分器** - 确定性 > 概率性
5. **安全方面的人工审查** - 永远不要完全自动化安全检查
6. **保持评估快速** - 慢速评估不会被运行
7. **对评估进行版本控制** - 评估是一等工件

## 示例：添加身份验证 (Example: Adding Authentication)

```markdown
## EVAL: add-authentication

### Phase 1: Define (10 min)
Capability Evals:
- [ ] User can register with email/password
- [ ] User can login with valid credentials
- [ ] Invalid credentials rejected with proper error
- [ ] Sessions persist across page reloads
- [ ] Logout clears session

Regression Evals:
- [ ] Public routes still accessible
- [ ] API responses unchanged
- [ ] Database schema compatible

### Phase 2: Implement (varies)
[Write code]

### Phase 3: Evaluate
Run: /eval check add-authentication

### Phase 4: Report
EVAL REPORT: add-authentication
==============================
Capability: 5/5 passed (pass@3: 100%)
Regression: 3/3 passed (pass^3: 100%)
Status: SHIP IT
```
