---
name: continuous-learning-v2
description: 基于本能的学习系统，通过钩子观察会话，创建带有置信度评分的原子本能，并将其演进为技能/命令/代理。
version: 2.0.0
---

# 持续学习 v2 - 基于本能的架构 (Continuous Learning v2 - Instinct-Based Architecture)

一个高级学习系统，通过原子 "本能 (instincts)"——带有置信度评分的小型习得行为——将你的 Claude Code 会话转化为可重用的知识。

## v2 的新特性 (What's New in v2)

| 特性 | v1 | v2 |
|---------|----|----|
| 观察 | Stop hook (会话结束) | PreToolUse/PostToolUse (100% 可靠) |
| 分析 | 主上下文 | 后台代理 (Haiku) |
| 粒度 | 完整技能 | 原子 "本能 (instincts)" |
| 置信度 | 无 | 0.3-0.9 加权 |
| 演进 | 直接转为技能 | 本能 → 聚类 → 技能/命令/代理 |
| 共享 | 无 | 导出/导入本能 |

## 本能模型 (The Instinct Model)

本能是一个小型的习得行为：

```yaml
---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.7
domain: "code-style"
source: "session-observation"
---

# 偏好函数式风格 (Prefer Functional Style)

## 动作 (Action)
在适当的时候使用函数式模式而不是类。

## 证据 (Evidence)
- 观察到 5 个函数式模式偏好的实例
- 用户在 2025-01-15 将基于类的方法纠正为函数式
```

**属性:**
- **原子性** — 一个触发器，一个动作
- **置信度加权** — 0.3 = 尝试性，0.9 = 几乎确定
- **领域标记** — 代码风格、测试、git、调试、工作流等
- **证据支持** — 跟踪哪些观察创建了它

## 工作原理 (How It Works)

```
会话活动 (Session Activity)
      │
      │ 钩子捕获提示 + 工具使用 (100% 可靠)
      ▼
┌─────────────────────────────────────────┐
│         observations.jsonl              │
│   (prompts, tool calls, outcomes)       │
└─────────────────────────────────────────┘
      │
      │ 观察者代理读取 (后台, Haiku)
      ▼
┌─────────────────────────────────────────┐
│          模式检测 (PATTERN DETECTION)    │
│   • 用户纠正 → 本能                      │
│   • 错误解决 → 本能                      │
│   • 重复工作流 → 本能                    │
└─────────────────────────────────────────┘
      │
      │ 创建/更新
      ▼
┌─────────────────────────────────────────┐
│         instincts/personal/             │
│   • prefer-functional.md (0.7)          │
│   • always-test-first.md (0.9)          │
│   • use-zod-validation.md (0.6)         │
└─────────────────────────────────────────┘
      │
      │ /evolve 聚类
      ▼
┌─────────────────────────────────────────┐
│              evolved/                   │
│   • commands/new-feature.md             │
│   • skills/testing-workflow.md          │
│   • agents/refactor-specialist.md       │
└─────────────────────────────────────────┘
```

## 快速开始 (Quick Start)

### 1. 启用观察钩子 (Enable Observation Hooks)

添加到你的 `~/.claude/settings.json`。

**如果作为插件安装** (推荐):

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh pre"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh post"
      }]
    }]
  }
}
```

**如果手动安装** 到 `~/.claude/skills`:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh pre"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh post"
      }]
    }]
  }
}
```

### 2. 初始化目录结构 (Initialize Directory Structure)

Python CLI 会自动创建这些，但你也可以手动创建：

```bash
mkdir -p ~/.claude/homunculus/{instincts/{personal,inherited},evolved/{agents,skills,commands}}
touch ~/.claude/homunculus/observations.jsonl
```

### 3. 使用本能命令 (Use the Instinct Commands)

```bash
/instinct-status     # 显示学习到的本能及其置信度分数
/evolve              # 将相关本能聚类为技能/命令
/instinct-export     # 导出本能以进行共享
/instinct-import     # 导入其他人的本能
```

## 命令 (Commands)

| 命令 | 描述 |
|---------|-------------|
| `/instinct-status` | 显示所有学习到的本能及置信度 |
| `/evolve` | 将相关本能聚类为技能/命令 |
| `/instinct-export` | 导出本能以进行共享 |
| `/instinct-import <file>` | 导入其他人的本能 |

## 配置 (Configuration)

编辑 `config.json`:

```json
{
  "version": "2.0",
  "observation": {
    "enabled": true,
    "store_path": "~/.claude/homunculus/observations.jsonl",
    "max_file_size_mb": 10,
    "archive_after_days": 7
  },
  "instincts": {
    "personal_path": "~/.claude/homunculus/instincts/personal/",
    "inherited_path": "~/.claude/homunculus/instincts/inherited/",
    "min_confidence": 0.3,
    "auto_approve_threshold": 0.7,
    "confidence_decay_rate": 0.05
  },
  "observer": {
    "enabled": true,
    "model": "haiku",
    "run_interval_minutes": 5,
    "patterns_to_detect": [
      "user_corrections",
      "error_resolutions",
      "repeated_workflows",
      "tool_preferences"
    ]
  },
  "evolution": {
    "cluster_threshold": 3,
    "evolved_path": "~/.claude/homunculus/evolved/"
  }
}
```

## 文件结构 (File Structure)

```
~/.claude/homunculus/
├── identity.json           # 你的个人资料，技术水平
├── observations.jsonl      # 当前会话观察
├── observations.archive/   # 已处理的观察
├── instincts/
│   ├── personal/           # 自动学习的本能
│   └── inherited/          # 从他人导入的本能
└── evolved/
    ├── agents/             # 生成的专家代理
    ├── skills/             # 生成的技能
    └── commands/           # 生成的命令
```

## 与 Skill Creator 集成 (Integration with Skill Creator)

当你使用 [Skill Creator GitHub App](https://skill-creator.app) 时，它现在会生成 **两者**：
- 传统的 SKILL.md 文件 (用于向后兼容)
- 本能集合 (用于 v2 学习系统)

来自仓库分析的本能具有 `source: "repo-analysis"` 并包含源仓库 URL。

## 置信度评分 (Confidence Scoring)

置信度随时间演变：

| 分数 | 含义 | 行为 |
|-------|---------|----------|
| 0.3 | 尝试性 | 建议但不强制执行 |
| 0.5 | 中等 | 相关时应用 |
| 0.7 | 强 | 自动批准应用 |
| 0.9 | 几乎确定 | 核心行为 |

**置信度增加** 当：
- 模式被重复观察到
- 用户没有纠正建议的行为
- 来自其他来源的类似本能一致

**置信度降低** 当：
- 用户明确纠正了行为
- 长时间未观察到模式
- 出现矛盾的证据

## 为什么使用 Hooks 而不是 Skills 进行观察？ (Why Hooks vs Skills for Observation?)

> "v1 依赖技能来观察。技能是概率性的——它们根据 Claude 的判断大约有 50-80% 的时间触发。"

钩子 **100% 的时间** 确定性地触发。这意味着：
- 每次工具调用都被观察到
- 没有模式被遗漏
- 学习是全面的

## 向后兼容性 (Backward Compatibility)

v2 与 v1 完全兼容：
- 现有的 `~/.claude/skills/learned/` 技能仍然有效
- Stop hook 仍然运行 (但现在也馈送到 v2)
- 渐进式迁移路径：并行运行两者

## 隐私 (Privacy)

- 观察结果保留在你的机器 **本地**
- 只有 **本能** (模式) 可以导出
- 没有实际的代码或对话内容被共享
- 你控制导出什么

## 相关 (Related)

- [Skill Creator](https://skill-creator.app) - 从仓库历史生成本能
- [Homunculus](https://github.com/humanplane/homunculus) - v2 架构的灵感来源
- [长篇指南](https://x.com/affaanmustafa/status/2014040193557471352) - 持续学习部分

---

*基于本能的学习：一次一个观察，教给 Claude 你的模式。*
