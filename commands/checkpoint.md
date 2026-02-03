# 检查点命令 (Checkpoint Command)

在你的工作流中创建或验证检查点。

## 用法

`/checkpoint [create|verify|list] [name]`

## 创建检查点 (Create Checkpoint)

当创建检查点时：

1. 运行 `/verify quick` 以确保当前状态是干净的
2. 创建一个带有检查点名称的 git stash 或 commit
3. 将检查点记录到 `.claude/checkpoints.log`：

```bash
echo "$(date +%Y-%m-%d-%H:%M) | $CHECKPOINT_NAME | $(git rev-parse --short HEAD)" >> .claude/checkpoints.log
```

4. 报告检查点已创建

## 验证检查点 (Verify Checkpoint)

当针对检查点进行验证时：

1. 从日志中读取检查点
2. 将当前状态与检查点进行比较：
   - 自检查点以来添加的文件
   - 自检查点以来修改的文件
   - 现在 vs 当时的测试通过率
   - 现在 vs 当时的覆盖率

3. 报告：
```
CHECKPOINT COMPARISON: $NAME
============================
Files changed: X
Tests: +Y passed / -Z failed
Coverage: +X% / -Y%
Build: [PASS/FAIL]
```

## 列出检查点 (List Checkpoints)

显示所有检查点，包含：
- 名称
- 时间戳
- Git SHA
- 状态 (当前, 落后, 领先)

## 工作流

典型的检查点流程：

```
[开始] --> /checkpoint create "feature-start"
   |
[实现] --> /checkpoint create "core-done"
   |
[测试] --> /checkpoint verify "core-done"
   |
[重构] --> /checkpoint create "refactor-done"
   |
[PR] --> /checkpoint verify "feature-start"
```

## 参数

$ARGUMENTS:
- `create <name>` - 创建命名检查点
- `verify <name>` - 针对命名检查点进行验证
- `list` - 显示所有检查点
- `clear` - 移除旧检查点 (保留最近 5 个)
