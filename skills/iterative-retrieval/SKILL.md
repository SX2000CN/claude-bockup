---
name: iterative-retrieval
description: 逐步完善上下文检索以解决子代理上下文问题的模式
---

# 迭代检索模式 (Iterative Retrieval Pattern)

解决多代理工作流中 "上下文问题" 的方案，即子代理在开始工作之前不知道它们需要什么上下文。

## 问题 (The Problem)

子代理在生成时上下文有限。它们不知道：
- 哪些文件包含相关代码
- 代码库中存在什么模式
- 项目使用什么术语

标准方法会失败：
- **发送所有内容**: 超出上下文限制
- **什么都不发送**: 代理缺乏关键信息
- **猜测需要什么**: 经常出错

## 解决方案：迭代检索 (The Solution: Iterative Retrieval)

一个逐步完善上下文的 4 阶段循环：

```
┌─────────────────────────────────────────────┐
│                                             │
│   ┌──────────┐      ┌──────────┐            │
│   │ 分发     │─────▶│ 评估     │            │
│   │ DISPATCH │      │ EVALUATE │            │
│   └──────────┘      └──────────┘            │
│        ▲                  │                 │
│        │                  ▼                 │
│   ┌──────────┐      ┌──────────┐            │
│   │ 循环     │◀─────│ 精炼     │            │
│   │ LOOP     │      │ REFINE   │            │
│   └──────────┘      └──────────┘            │
│                                             │
│        最多 3 个周期，然后继续              │
└─────────────────────────────────────────────┘
```

### 阶段 1: 分发 (DISPATCH)

初始广泛查询以收集候选文件：

```javascript
// 从高级意图开始
const initialQuery = {
  patterns: ['src/**/*.ts', 'lib/**/*.ts'],
  keywords: ['authentication', 'user', 'session'],
  excludes: ['*.test.ts', '*.spec.ts']
};

// 分发给检索代理
const candidates = await retrieveFiles(initialQuery);
```

### 阶段 2: 评估 (EVALUATE)

评估检索到的内容的相关性：

```javascript
function evaluateRelevance(files, task) {
  return files.map(file => ({
    path: file.path,
    relevance: scoreRelevance(file.content, task),
    reason: explainRelevance(file.content, task),
    missingContext: identifyGaps(file.content, task)
  }));
}
```

评分标准：
- **高 (0.8-1.0)**: 直接实现目标功能
- **中 (0.5-0.7)**: 包含相关模式或类型
- **低 (0.2-0.4)**: 稍微相关
- **无 (0-0.2)**: 不相关，排除

### 阶段 3: 精炼 (REFINE)

根据评估更新搜索条件：

```javascript
function refineQuery(evaluation, previousQuery) {
  return {
    // 添加在高相关性文件中发现的新模式
    patterns: [...previousQuery.patterns, ...extractPatterns(evaluation)],

    // 添加在代码库中发现的术语
    keywords: [...previousQuery.keywords, ...extractKeywords(evaluation)],

    // 排除已确认不相关的路径
    excludes: [...previousQuery.excludes, ...evaluation
      .filter(e => e.relevance < 0.2)
      .map(e => e.path)
    ],

    // 针对特定缺口
    focusAreas: evaluation
      .flatMap(e => e.missingContext)
      .filter(unique)
  };
}
```

### 阶段 4: 循环 (LOOP)

使用精炼后的条件重复（最多 3 个周期）：

```javascript
async function iterativeRetrieve(task, maxCycles = 3) {
  let query = createInitialQuery(task);
  let bestContext = [];

  for (let cycle = 0; cycle < maxCycles; cycle++) {
    const candidates = await retrieveFiles(query);
    const evaluation = evaluateRelevance(candidates, task);

    // 检查我们是否有足够的上下文
    const highRelevance = evaluation.filter(e => e.relevance >= 0.7);
    if (highRelevance.length >= 3 && !hasCriticalGaps(evaluation)) {
      return highRelevance;
    }

    // 精炼并继续
    query = refineQuery(evaluation, query);
    bestContext = mergeContext(bestContext, highRelevance);
  }

  return bestContext;
}
```

## 实践示例 (Practical Examples)

### 示例 1: Bug 修复上下文

```
任务: "修复认证令牌过期 bug"

周期 1:
  分发: 在 src/** 中搜索 "token", "auth", "expiry"
  评估: 找到 auth.ts (0.9), tokens.ts (0.8), user.ts (0.3)
  精炼: 添加 "refresh", "jwt" 关键字; 排除 user.ts

周期 2:
  分发: 搜索精炼后的术语
  评估: 找到 session-manager.ts (0.95), jwt-utils.ts (0.85)
  精炼: 上下文足够 (2 个高相关性文件)

结果: auth.ts, tokens.ts, session-manager.ts, jwt-utils.ts
```

### 示例 2: 功能实现

```
任务: "为 API 端点添加速率限制"

周期 1:
  分发: 在 routes/** 中搜索 "rate", "limit", "api"
  评估: 无匹配 - 代码库使用 "throttle" 术语
  精炼: 添加 "throttle", "middleware" 关键字

周期 2:
  分发: 搜索精炼后的术语
  评估: 找到 throttle.ts (0.9), middleware/index.ts (0.7)
  精炼: 需要路由器模式

周期 3:
  分发: 搜索 "router", "express" 模式
  评估: 找到 router-setup.ts (0.8)
  精炼: 上下文足够

结果: throttle.ts, middleware/index.ts, router-setup.ts
```

## 与代理集成 (Integration with Agents)

在代理提示中使用：

```markdown
为此任务检索上下文时：
1. 从广泛的关键字搜索开始
2. 评估每个文件的相关性 (0-1 范围)
3. 识别仍然缺少的上下文
4. 精炼搜索条件并重复 (最多 3 个周期)
5. 返回相关性 >= 0.7 的文件
```

## 最佳实践 (Best Practices)

1. **先宽后窄** - 不要过度指定初始查询
2. **学习代码库术语** - 第一个周期通常会揭示命名约定
3. **跟踪缺失内容** - 明确的缺口识别推动精炼
4. **适可而止** - 3 个高相关性文件胜过 10 个平庸的文件
5. **自信地排除** - 低相关性文件不会变得相关

## 相关 (Related)

- [长篇指南](https://x.com/affaanmustafa/status/2014040193557471352) - 子代理编排部分
- `continuous-learning` 技能 - 用于随时间改进的模式
- `~/.claude/agents/` 中的代理定义
