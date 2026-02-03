# 验证循环技能 (Verification Loop Skill)

一个用于 Claude Code 会话的综合验证系统。

## 何时使用 (When to Use)

在以下情况调用此技能：
- 完成功能或重大代码更改后
- 创建 PR 之前
- 想要确保质量门控通过时
- 重构后

## 验证阶段 (Verification Phases)

### 阶段 1: 构建验证 (Build Verification)
```bash
# 检查项目是否构建成功
npm run build 2>&1 | tail -20
# 或者
pnpm build 2>&1 | tail -20
```

如果构建失败，**停止**并在继续之前进行修复。

### 阶段 2: 类型检查 (Type Check)
```bash
# TypeScript 项目
npx tsc --noEmit 2>&1 | head -30

# Python 项目
pyright . 2>&1 | head -30
```

报告所有类型错误。在继续之前修复关键错误。

### 阶段 3: Lint 检查 (Lint Check)
```bash
# JavaScript/TypeScript
npm run lint 2>&1 | head -30

# Python
ruff check . 2>&1 | head -30
```

### 阶段 4: 测试套件 (Test Suite)
```bash
# 运行带有覆盖率的测试
npm run test -- --coverage 2>&1 | tail -50

# 检查覆盖率阈值
# 目标: 最低 80%
```

报告：
- 总测试数: X
- 通过: X
- 失败: X
- 覆盖率: X%

### 阶段 5: 安全扫描 (Security Scan)
```bash
# 检查密钥
grep -rn "sk-" --include="*.ts" --include="*.js" . 2>/dev/null | head -10
grep -rn "api_key" --include="*.ts" --include="*.js" . 2>/dev/null | head -10

# 检查 console.log
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10
```

### 阶段 6: 差异审查 (Diff Review)
```bash
# 显示更改内容
git diff --stat
git diff HEAD~1 --name-only
```

审查每个更改的文件：
- 意外的更改
- 缺少的错误处理
- 潜在的边缘情况

## 输出格式 (Output Format)

运行所有阶段后，生成验证报告：

```
验证报告 (VERIFICATION REPORT)
==================

构建:     [通过/失败] (Build: [PASS/FAIL])
类型:     [通过/失败] (X 个错误) (Types: [PASS/FAIL] (X errors))
Lint:     [通过/失败] (X 个警告) (Lint: [PASS/FAIL] (X warnings))
测试:     [通过/失败] (X/Y 通过, Z% 覆盖率) (Tests: [PASS/FAIL] (X/Y passed, Z% coverage))
安全:     [通过/失败] (X 个问题) (Security: [PASS/FAIL] (X issues))
差异:     [X 个文件已更改] (Diff: [X files changed])

总体:     [准备好/未准备好] 提交 PR (Overall: [READY/NOT READY] for PR)

需要修复的问题 (Issues to Fix):
1. ...
2. ...
```

## 连续模式 (Continuous Mode)

对于长时间的会话，每 15 分钟或在重大更改后运行一次验证：

```markdown
设置心理检查点：
- 完成每个函数后
- 完成组件后
- 移动到下一个任务之前

运行: /verify
```

## 与 Hook 集成 (Integration with Hooks)

此技能补充了 PostToolUse hooks，但提供了更深层次的验证。
Hooks 立即捕获问题；此技能提供全面的审查。
