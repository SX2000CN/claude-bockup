---
description: 强制执行测试驱动开发工作流。首先搭建接口、生成测试，然后实现通过测试的最小代码。确保 80% 以上覆盖率。
---

# TDD 命令 (TDD Command)

此命令调用 **tdd-guide** agent 来强制执行测试驱动开发方法论。

## 此命令做什么

1. **搭建接口** - 首先定义类型/接口
2. **先生成测试** - 编写失败的测试 (红 - RED)
3. **实现最小代码** - 编写刚好能通过的代码 (绿 - GREEN)
4. **重构** - 改进代码同时保持测试通过 (重构 - REFACTOR)
5. **验证覆盖率** - 确保 80% 以上测试覆盖率

## 何时使用

在以下情况下使用 `/tdd`：
- 实现新功能
- 添加新函数/组件
- 修复 Bug (先编写重现 Bug 的测试)
- 重构现有代码
- 构建关键业务逻辑

## 工作原理

tdd-guide agent 将：

1. **定义接口** 输入/输出
2. **编写将失败的测试** (因为代码还不存在)
3. **运行测试** 并验证它们因正确的原因失败
4. **编写最小实现** 以使测试通过
5. **运行测试** 并验证它们通过
6. **重构** 代码同时保持测试变绿
7. **检查覆盖率** 如果低于 80% 则添加更多测试

## TDD 循环

```
红 (RED) → 绿 (GREEN) → 重构 (REFACTOR) → 重复 (REPEAT)

红:      编写一个失败的测试
绿:      编写最小代码以通过
重构:    改进代码，保持测试通过
重复:    下一个功能/场景
```

## 示例用法

```
User: /tdd 我需要一个计算市场流动性分数的函数

Agent (tdd-guide):
# TDD 会话：市场流动性分数计算器

## 第 1 步：定义接口 (搭建 - SCAFFOLD)

```typescript
// lib/liquidity.ts
export interface MarketData {
  totalVolume: number
  bidAskSpread: number
  activeTraders: number
  lastTradeTime: Date
}

export function calculateLiquidityScore(market: MarketData): number {
  // TODO: Implementation
  throw new Error('Not implemented')
}
```

## 第 2 步：编写失败测试 (红 - RED)

```typescript
// lib/liquidity.test.ts
import { calculateLiquidityScore } from './liquidity'

describe('calculateLiquidityScore', () => {
  it('should return high score for liquid market', () => {
    const market = {
      totalVolume: 100000,
      bidAskSpread: 0.01,
      activeTraders: 500,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeGreaterThan(80)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('should return low score for illiquid market', () => {
    const market = {
      totalVolume: 100,
      bidAskSpread: 0.5,
      activeTraders: 2,
      lastTradeTime: new Date(Date.now() - 86400000) // 1 day ago
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeLessThan(30)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('should handle edge case: zero volume', () => {
    const market = {
      totalVolume: 0,
      bidAskSpread: 0,
      activeTraders: 0,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBe(0)
  })
})
```

## 第 3 步：运行测试 - 验证失败 (FAIL)

```bash
npm test lib/liquidity.test.ts

FAIL lib/liquidity.test.ts
  ✕ should return high score for liquid market (2 ms)
    Error: Not implemented

1 test failed, 0 passed
```

✅ 测试按预期失败。准备实现。

## 第 4 步：实现最小代码 (绿 - GREEN)

```typescript
// lib/liquidity.ts
export function calculateLiquidityScore(market: MarketData): number {
  // Handle zero volume edge case
  if (market.totalVolume === 0) {
    return 0
  }

  // Calculate component scores (0-100 scale)
  const volumeScore = Math.min(market.totalVolume / 1000, 100)
  const spreadScore = Math.max(100 - (market.bidAskSpread * 1000), 0)
  const traderScore = Math.min(market.activeTraders / 10, 100)

  // Recent activity bonus
  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = Math.max(100 - (hoursSinceLastTrade * 10), 0)

  // Weighted average
  const score = (
    volumeScore * 0.4 +
    spreadScore * 0.3 +
    traderScore * 0.2 +
    recencyScore * 0.1
  )

  return Math.min(Math.max(score, 0), 100) // Clamp to 0-100
}
```

## 第 5 步：运行测试 - 验证通过 (PASS)

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

✅ 所有测试通过！

## 第 6 步：重构 (改进 - IMPROVE)

```typescript
// lib/liquidity.ts - Refactored with constants and better readability
const WEIGHTS = {
  VOLUME: 0.4,
  SPREAD: 0.3,
  TRADERS: 0.2,
  RECENCY: 0.1,
} as const

const SCALE_FACTORS = {
  VOLUME: 1000,
  SPREAD: 1000,
  TRADERS: 10,
  RECENCY_PENALTY: 10,
} as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function calculateLiquidityScore(market: MarketData): number {
  if (market.totalVolume === 0) return 0

  const volumeScore = Math.min(market.totalVolume / SCALE_FACTORS.VOLUME, 100)
  const spreadScore = clamp(100 - (market.bidAskSpread * SCALE_FACTORS.SPREAD), 0, 100)
  const traderScore = Math.min(market.activeTraders / SCALE_FACTORS.TRADERS, 100)

  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = clamp(100 - (hoursSinceLastTrade * SCALE_FACTORS.RECENCY_PENALTY), 0, 100)

  const weightedScore =
    volumeScore * WEIGHTS.VOLUME +
    spreadScore * WEIGHTS.SPREAD +
    traderScore * WEIGHTS.TRADERS +
    recencyScore * WEIGHTS.RECENCY

  return clamp(weightedScore, 0, 100)
}
```

## 第 7 步：验证测试仍然通过

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

✅ 重构完成，测试仍然通过！

## 第 8 步：检查覆盖率

```bash
npm test -- --coverage lib/liquidity.test.ts

File           | % Stmts | % Branch | % Funcs | % Lines
---------------|---------|----------|---------|--------
liquidity.ts   |   100   |   100    |   100   |   100

Coverage: 100% ✅ (Target: 80%)
```

✅ TDD 会话完成！
```

## TDD 最佳实践

**要 (DO):**
- ✅ 在任何实现**之前**，先写测试
- ✅ 运行测试并验证它们在实现前**失败**
- ✅ 编写最小代码以使测试通过
- ✅ 仅在测试变绿后重构
- ✅ 添加边缘情况和错误场景
- ✅ 目标 80%+ 覆盖率 (关键代码 100%)

**不要 (DON'T):**
- ❌ 在测试之前编写实现
- ❌ 跳过每次更改后运行测试
- ❌ 一次编写太多代码
- ❌ 忽略失败的测试
- ❌ 测试实现细节 (测试行为)
- ❌ 模拟一切 (首选集成测试)

## 要包含的测试类型

**单元测试** (函数级):
- 快乐路径场景
- 边缘情况 (空, null, 最大值)
- 错误条件
- 边界值

**集成测试** (组件级):
- API 端点
- 数据库操作
- 外部服务调用
- 带 Hooks 的 React 组件

**E2E 测试** (使用 `/e2e` 命令):
- 关键用户流程
- 多步过程
- 全栈集成

## 覆盖率要求

- 所有代码 **最低 80%**
- 以下代码 **必须 100%**:
  - 金融计算
  - 认证逻辑
  - 安全关键代码
  - 核心业务逻辑

## 重要提示

**强制性**：测试必须在实现之前编写。TDD 循环是：

1. **红 (RED)** - 编写失败测试
2. **绿 (GREEN)** - 实现以通过
3. **重构 (REFACTOR)** - 改进代码

永远不要跳过红阶段。永远不要在测试之前写代码。

## 与其他命令集成

- 首先使用 `/plan` 了解要构建什么
- 使用 `/tdd` 带测试实现
- 如果出现构建错误，使用 `/build-and-fix`
- 使用 `/code-review` 审查实现
- 使用 `/test-coverage` 验证覆盖率

## 相关 Agent

此命令调用位于此处的 `tdd-guide` agent：
`~/.claude/agents/tdd-guide.md`

并且可以引用位于此处的 `tdd-workflow` skill：
`~/.claude/skills/tdd-workflow/`
