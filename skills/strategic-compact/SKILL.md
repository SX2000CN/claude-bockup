---
name: strategic-compact
description: 建议在逻辑间隔进行手动上下文压缩，以在任务阶段保留上下文，而不是依赖任意的自动压缩。
---

# 战略性压缩技能 (Strategic Compact Skill)

建议在工作流的战略要点使用手动 `/compact`，而不是依赖任意的自动压缩。

## 为什么要进行战略性压缩？ (Why Strategic Compaction?)

自动压缩会在任意点触发：
- 通常在任务中期，导致丢失重要上下文
- 无法感知逻辑任务边界
- 可能会中断复杂的多步骤操作

在逻辑边界进行战略性压缩：
- **探索之后，执行之前** - 压缩研究上下文，保留实施计划
- **完成里程碑之后** - 为下一阶段重新开始
- **主要上下文切换之前** - 在不同任务之前清除探索上下文

## 工作原理 (How It Works)

`suggest-compact.sh` 脚本在 PreToolUse (Edit/Write) 上运行，并且：

1. **跟踪工具调用** - 统计会话中的工具调用次数
2. **阈值检测** - 在可配置的阈值处建议 (默认: 50 次调用)
3. **定期提醒** - 达到阈值后每 25 次调用提醒一次

## Hook 设置 (Hook Setup)

添加到你的 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "tool == \"Edit\" || tool == \"Write\"",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/strategic-compact/suggest-compact.sh"
      }]
    }]
  }
}
```

## 配置 (Configuration)

环境变量：
- `COMPACT_THRESHOLD` - 首次建议前的工具调用次数 (默认: 50)

## 最佳实践 (Best Practices)

1. **计划后压缩** - 计划确定后，压缩以重新开始
2. **调试后压缩** - 在继续之前清除错误解决上下文
3. **不要在实施中期压缩** - 为相关更改保留上下文
4. **阅读建议** - 钩子告诉你 *何时*，你决定 *是否*

## 相关 (Related)

- [长篇指南](https://x.com/affaanmustafa/status/2014040193557471352) - Token 优化部分
- 记忆持久化钩子 - 用于在压缩后幸存的状态
