# /learn - 手动提取经验 (Manual Pattern Extraction)

请求 AI 分析当前会话并提取值得保存的经验模式。
这不同于 `/finish` (自动运行脚本)，这是一个交互式的过程，允许您审查和编辑生成的技能。

## 触发条件
当您刚刚解决了一个复杂问题，或者发现了一个想记录下来的“坑”时使用。

## 执行步骤

1.  **回顾会话**：分析最近的对话历史。
2.  **寻找模式**：
    *   错误解决 (Error Resolution)
    *   调试技巧 (Debugging Techniques)
    *   项目约定 (Project Conventions)
3.  **生成技能文件**：
    *   在内存中起草一个 Markdown 格式的技能文件。
    *   文件应包含：问题描述、解决方案、代码示例、适用场景。
4.  **保存**：
    *   向用户展示草稿。
    *   如果用户同意，使用 `Write` 工具将其保存到 `~/.claude/skills/learned/[pattern-name].md`。

## 示例输出格式

```markdown
# [模式名称]

**Extracted:** 2024-xx-xx
**Context:** [简述]

## 问题
...

## 解决方案
...
```
