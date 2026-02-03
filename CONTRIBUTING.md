# 贡献指南 (Contributing to Everything Claude Code)

感谢您想要做出贡献。本仓库旨在成为 Claude Code 用户的社区资源。

## 我们在寻找什么

### Agents

能够出色处理特定任务的新 Agent：
- 特定语言的审查员 (Python, Go, Rust)
- 框架专家 (Django, Rails, Laravel, Spring)
- DevOps 专家 (Kubernetes, Terraform, CI/CD)
- 领域专家 (ML pipelines, data engineering, mobile)

### Skills

工作流定义和领域知识：
- 语言最佳实践
- 框架模式
- 测试策略
- 架构指南
- 领域特定知识

### Commands

调用有用工作流的 Slash 命令：
- 部署命令
- 测试命令
- 文档命令
- 代码生成命令

### Hooks

有用的自动化脚本：
- Linting/格式化钩子
- 安全检查
- 验证钩子
- 通知钩子

### Rules

必须遵循的准则：
- 安全规则
- 代码风格规则
- 测试要求
- 命名约定

### MCP 配置

新的或改进的 MCP 服务器配置：
- 数据库集成
- 云提供商 MCP
- 监控工具
- 通讯工具

---

## 如何贡献

### 1. Fork 仓库

```bash
git clone https://github.com/YOUR_USERNAME/everything-claude-code.git
cd everything-claude-code
```

### 2. 创建分支

```bash
git checkout -b add-python-reviewer
```

### 3. 添加您的贡献

将文件放置在相应的目录中：
- `agents/` 用于新 Agent
- `skills/` 用于 Skills (可以是单个 .md 或目录)
- `commands/` 用于 Slash 命令
- `rules/` 用于规则文件
- `hooks/` 用于钩子配置
- `mcp-configs/` 用于 MCP 服务器配置

### 4. 遵循格式

**Agents** 应该包含 frontmatter：

```markdown
---
name: agent-name
description: 它做什么
tools: Read, Grep, Glob, Bash
model: sonnet
---

这里是指令...
```

**Skills** 应该清晰且可操作：

```markdown
# 技能名称 (Skill Name)

## 何时使用 (When to Use)

...

## 如何工作 (How It Works)

...

## 示例 (Examples)

...
```

**Commands** 应该解释它们的作用：

```markdown
---
description: 命令的简短描述
---

# 命令名称 (Command Name)

详细指令...
```

**Hooks** 应该包含描述：

```json
{
  "matcher": "...",
  "hooks": [...],
  "description": "这个钩子做什么"
}
```

### 5. 测试您的贡献

在提交之前，请确保您的配置可以在 Claude Code 中正常工作。

### 6. 提交 PR

```bash
git add .
git commit -m "Add Python code reviewer agent"
git push origin add-python-reviewer
```

然后打开一个 PR，包含：
- 您添加了什么
- 为什么它有用
- 您是如何测试的

---

## 准则

### 要做 (Do)

- 保持配置专注且模块化
- 包含清晰的描述
- 提交前进行测试
- 遵循现有模式
- 记录任何依赖项

### 不要 (Don't)

- 包含敏感数据 (API 密钥, tokens, 路径)
- 添加过于复杂或小众的配置
- 提交未测试的配置
- 创建重复的功能
- 添加需要特定付费服务且无替代方案的配置

---

## 文件命名

- 使用小写连字符：`python-reviewer.md`
- 描述性强：用 `tdd-workflow.md` 而不是 `workflow.md`
- 保持 Agent/Skill 名称与文件名一致

---

## 有问题？

提交 Issue 或在 X 上联系：[@affaanmustafa](https://x.com/affaanmustafa)

---

感谢您的贡献。让我们一起建立一个伟大的资源库。
