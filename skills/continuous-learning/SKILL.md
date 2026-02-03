---
name: continuous-learning
description: 自动从 Claude Code 会话中提取可重用的模式，并将其保存为学习到的技能以供将来使用。
---

# 持续学习技能 (Continuous Learning Skill)

自动在会话结束时评估 Claude Code 会话，提取可重用的模式，并保存为学习到的技能。

## 工作原理 (How It Works)

此技能作为 **Stop hook** 在每次会话结束时运行：

1. **会话评估**: 检查会话是否有足够的消息 (默认: 10+)
2. **模式检测**: 从会话中识别可提取的模式
3. **技能提取**: 将有用的模式保存到 `~/.claude/skills/learned/`

## 配置 (Configuration)

编辑 `config.json` 进行自定义：

```json
{
  "min_session_length": 10,
  "extraction_threshold": "medium",
  "auto_approve": false,
  "learned_skills_path": "~/.claude/skills/learned/",
  "patterns_to_detect": [
    "error_resolution",
    "user_corrections",
    "workarounds",
    "debugging_techniques",
    "project_specific"
  ],
  "ignore_patterns": [
    "simple_typos",
    "one_time_fixes",
    "external_api_issues"
  ]
}
```

## 模式类型 (Pattern Types)

| 模式 | 描述 |
|---------|-------------|
| `error_resolution` | 如何解决特定错误 |
| `user_corrections` | 来自用户纠正的模式 |
| `workarounds` | 框架/库的怪癖的解决方案 |
| `debugging_techniques` | 有效的调试方法 |
| `project_specific` | 特定于项目的约定 |

## Hook 设置 (Hook Setup)

添加到你的 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning/evaluate-session.sh"
      }]
    }]
  }
}
```

## 为什么要使用 Stop Hook？ (Why Stop Hook?)

- **轻量级**: 在会话结束时运行一次
- **非阻塞**: 不会增加每条消息的延迟
- **完整上下文**: 可以访问完整的会话记录

## 相关 (Related)

- [长篇指南](https://x.com/affaanmustafa/status/2014040193557471352) - 持续学习部分
- `/learn` 命令 - 会话中期的手动模式提取

---

## 比较说明 (研究: 2025年1月) (Comparison Notes)

### vs Homunculus (github.com/humanplane/homunculus)

Homunculus v2 采用了一种更复杂的方法：

| 特性 | 我们的方法 | Homunculus v2 |
|---------|--------------|---------------|
| 观察 | Stop hook (会话结束) | PreToolUse/PostToolUse hooks (100% 可靠) |
| 分析 | 主上下文 | 后台代理 (Haiku) |
| 粒度 | 完整技能 | 原子 "本能 (instincts)" |
| 置信度 | 无 | 0.3-0.9 加权 |
| 演进 | 直接转为技能 | 本能 → 聚类 → 技能/命令/代理 |
| 共享 | 无 | 导出/导入本能 |

**来自 homunculus 的关键见解:**
> "v1 依赖技能来观察。技能是概率性的——它们大约有 50-80% 的时间触发。v2 使用钩子进行观察 (100% 可靠)，并将本能作为习得行为的原子单位。"

### 潜在的 v2 增强功能 (Potential v2 Enhancements)

1. **基于本能的学习** - 带有置信度评分的更小、原子的行为
2. **后台观察者** - Haiku 代理并行分析
3. **置信度衰减** - 如果被反驳，本能会失去置信度
4. **领域标记** - 代码风格、测试、git、调试等
5. **演进路径** - 将相关本能聚类为技能/命令

参见: `/Users/affoon/Documents/tasks/12-continuous-learning-v2.md` 获取完整规范。
