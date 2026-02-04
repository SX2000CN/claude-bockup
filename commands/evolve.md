---
name: evolve
description: 将相关的直觉 (instincts) 聚类为技能、命令或 agent
command: true
---

# 进化命令 (Evolve Command)

## 实现

运行 instinct CLI：

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py evolve [--generate]
```

分析直觉并将相关的聚类为更高级的结构：
- **Commands (命令)**：当直觉描述用户调用的操作时
- **Skills (技能)**：当直觉描述自动触发的行为时
- **Agents (代理)**：当直觉描述复杂的、多步骤的流程时

## 用法

```
/evolve                    # 分析所有直觉并建议进化
/evolve --domain testing   # 仅进化测试领域的直觉
/evolve --dry-run          # 显示将创建什么但不创建
/evolve --threshold 5      # 需要 5+ 相关直觉才能聚类
```

## 进化规则

### → Command (用户调用)
当直觉描述用户会明确请求的操作时：
- 关于“当用户要求...”的多个直觉
- 带有像“当创建新 X 时”的触发器的直觉
- 遵循可重复序列的直觉

示例：
- `new-table-step1`: "添加数据库表时，创建迁移"
- `new-table-step2`: "添加数据库表时，更新模式"
- `new-table-step3`: "添加数据库表时，重新生成类型"

→ 创建：`/new-table` 命令

### → Skill (自动触发)
当直觉描述应该自动发生的行为时：
- 模式匹配触发器
- 错误处理响应
- 代码风格强制

示例：
- `prefer-functional`: "编写函数时，首选函数式风格"
- `use-immutable`: "修改状态时，使用不可变模式"
- `avoid-classes`: "设计模块时，避免基于类的设计"

→ 创建：`functional-patterns` 技能

### → Agent (需要深度/隔离)
当直觉描述受益于隔离的复杂、多步骤流程时：
- 调试工作流
- 重构序列
- 研究任务

示例：
- `debug-step1`: "调试时，首先检查日志"
- `debug-step2`: "调试时，隔离失败的组件"
- `debug-step3`: "调试时，创建最小复现"
- `debug-step4`: "调试时，用测试验证修复"

→ 创建：`debugger` agent

## 做什么

1. 从 `~/.claude/homunculus/instincts/` 读取所有直觉
2. 对直觉进行分组，依据：
   - 领域相似性
   - 触发器模式重叠
   - 动作序列关系
3. 对于每个包含 3+ 相关直觉的聚类：
   - 确定进化类型 (command/skill/agent)
   - 生成相应文件
   - 保存到 `~/.claude/homunculus/evolved/{commands,skills,agents}/`
4. 将进化结构链接回源直觉

## 输出格式

```
🧬 Evolve Analysis
==================

Found 3 clusters ready for evolution:

## Cluster 1: Database Migration Workflow
Instincts: new-table-migration, update-schema, regenerate-types
Type: Command
Confidence: 85% (based on 12 observations)

Would create: /new-table command
Files:
  - ~/.claude/homunculus/evolved/commands/new-table.md

## Cluster 2: Functional Code Style
Instincts: prefer-functional, use-immutable, avoid-classes, pure-functions
Type: Skill
Confidence: 78% (based on 8 observations)

Would create: functional-patterns skill
Files:
  - ~/.claude/homunculus/evolved/skills/functional-patterns.md

## Cluster 3: Debugging Process
Instincts: debug-check-logs, debug-isolate, debug-reproduce, debug-verify
Type: Agent
Confidence: 72% (based on 6 observations)

Would create: debugger agent
Files:
  - ~/.claude/homunculus/evolved/agents/debugger.md

---
Run `/evolve --execute` to create these files.
```

## 标志 (Flags)

- `--execute`: 实际创建进化结构（默认为预览）
- `--dry-run`: 预览而不创建
- `--domain <name>`: 仅进化指定领域的直觉
- `--threshold <n>`: 形成聚类所需的最小直觉数（默认：3）
- `--type <command|skill|agent>`: 仅创建指定类型

## 生成的文件格式

### Command
```markdown
---
name: new-table
description: Create a new database table with migration, schema update, and type generation
command: /new-table
evolved_from:
  - new-table-migration
  - update-schema
  - regenerate-types
---

# New Table Command

[Generated content based on clustered instincts]

## Steps
1. ...
2. ...
```

### Skill
```markdown
---
name: functional-patterns
description: Enforce functional programming patterns
evolved_from:
  - prefer-functional
  - use-immutable
  - avoid-classes
---

# Functional Patterns Skill

[Generated content based on clustered instincts]
```

### Agent
```markdown
---
name: debugger
description: Systematic debugging agent
model: sonnet
evolved_from:
  - debug-check-logs
  - debug-isolate
  - debug-reproduce
---

# Debugger Agent

[Generated content based on clustered instincts]
```
