---
name: instinct-import
description: 从队友、Skill Creator 或其他来源导入直觉 (instincts)
command: true
---

# 直觉导入命令 (Instinct Import Command)

## 实现 (Implementation)

运行 instinct CLI：

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import <file-or-url> [--dry-run] [--force] [--min-confidence 0.7]
```

从以下来源导入直觉：
- 队友的导出文件
- Skill Creator (仓库分析)
- 社区集合
- 以前的机器备份

## 用法 (Usage)

```
/instinct-import team-instincts.yaml
/instinct-import https://github.com/org/repo/instincts.yaml
/instinct-import --from-skill-creator acme/webapp
```

## 此命令做什么 (What to Do)

1. 获取直觉文件（本地路径或 URL）
2. 解析并验证格式
3. 检查与现有直觉的重复项
4. 合并或添加新直觉
5. 保存到 `~/.claude/homunculus/instincts/inherited/`

## 导入过程 (Import Process)

```
📥 Importing instincts from: team-instincts.yaml
================================================

Found 12 instincts to import.

Analyzing conflicts...

## New Instincts (8)
These will be added:
  ✓ use-zod-validation (confidence: 0.7)
  ✓ prefer-named-exports (confidence: 0.65)
  ✓ test-async-functions (confidence: 0.8)
  ...

## Duplicate Instincts (3)
Already have similar instincts:
  ⚠️ prefer-functional-style
     Local: 0.8 confidence, 12 observations
     Import: 0.7 confidence
     → Keep local (higher confidence)

  ⚠️ test-first-workflow
     Local: 0.75 confidence
     Import: 0.9 confidence
     → Update to import (higher confidence)

## Conflicting Instincts (1)
These contradict local instincts:
  ❌ use-classes-for-services
     Conflicts with: avoid-classes
     → Skip (requires manual resolution)

---
Import 8 new, update 1, skip 3?
```

## 合并策略 (Merge Strategies)

### 对于重复项 (For Duplicates)
当导入的直觉与现有的匹配时：
- **置信度高者胜**：保留置信度较高的那个
- **合并证据**：合并观察计数
- **更新时间戳**：标记为最近验证

### 对于冲突 (For Conflicts)
当导入的直觉与现有的相矛盾时：
- **默认跳过**：不导入冲突的直觉
- **标记审查**：标记两者都需要关注
- **手动解决**：用户决定保留哪个

## 来源追踪 (Source Tracking)

导入的直觉标记有：
```yaml
source: "inherited"
imported_from: "team-instincts.yaml"
imported_at: "2025-01-22T10:30:00Z"
original_source: "session-observation"  # or "repo-analysis"
```

## Skill Creator 集成

从 Skill Creator 导入时：

```
/instinct-import --from-skill-creator acme/webapp
```

这将获取从仓库分析生成的直觉：
- 来源：`repo-analysis`
- 更高的初始置信度 (0.7+)
- 链接到源仓库

## 标志 (Flags)

- `--dry-run`: 预览而不导入
- `--force`: 即使存在冲突也导入
- `--merge-strategy <higher|local|import>`: 如何处理重复项
- `--from-skill-creator <owner/repo>`: 从 Skill Creator 分析中导入
- `--min-confidence <n>`: 仅导入高于阈值的直觉

## 输出 (Output)

导入后：
```
✅ Import complete!

Added: 8 instincts
Updated: 1 instinct
Skipped: 3 instincts (2 duplicates, 1 conflict)

New instincts saved to: ~/.claude/homunculus/instincts/inherited/

Run /instinct-status to see all instincts.
```
