# /finish - 结束工作并存档 (End Session & Archive)

手动触发“会话结束”逻辑。这在无法触发自动退出钩子（如直接关闭 VSCode）时非常有用。

## 核心动作 (Actions)

请依次运行以下两个脚本，确保记忆和技能都被保存。

### 1. 保存会话记忆 (Save Memory)
将当前会话的摘要更新到 `memory.md`。

```bash
node ~/.claude/scripts/hooks/session-end.js
```

### 2. 提取学习模式 (Extract Patterns)
分析会话历史，将有价值的经验提取为新的技能。

```bash
node ~/.claude/scripts/hooks/evaluate-session.js
```

---

## 运行后
脚本运行完成后，请告知用户：“✅ 工作已存档。记忆已更新，新技能（如有）已提取。您现在可以安全关闭窗口了。”
