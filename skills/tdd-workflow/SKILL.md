---
name: tdd-workflow
description: 在编写新功能、修复 Bug 或重构代码时使用此技能。强制执行测试驱动开发 (TDD)，要求 80% 以上的覆盖率，包括单元测试、集成测试和 E2E 测试。
---

# 测试驱动开发工作流 (Test-Driven Development Workflow)

此技能确保所有代码开发都遵循 TDD 原则，并具有全面的测试覆盖率。

## 何时激活 (When to Activate)

- 编写新功能或功能
- 修复 Bug 或问题
- 重构现有代码
- 添加 API 端点
- 创建新组件

## 核心原则 (Core Principles)

### 1. 先写测试，再写代码 (Tests BEFORE Code)
始终先编写测试，然后实施代码以通过测试。

### 2. 覆盖率要求 (Coverage Requirements)
- 最低 80% 覆盖率（单元 + 集成 + E2E）
- 覆盖所有边缘情况
- 测试错误场景
- 验证边界条件

### 3. 测试类型 (Test Types)

#### 单元测试 (Unit Tests)
- 单个函数和工具
- 组件逻辑
- 纯函数
- 助手和工具

#### 集成测试 (Integration Tests)
- API 端点
- 数据库操作
- 服务交互
- 外部 API 调用

#### E2E 测试 (E2E Tests) (Playwright)
- 关键用户流程
- 完整工作流
- 浏览器自动化
- UI 交互

## TDD 工作流步骤 (TDD Workflow Steps)

### 步骤 1: 编写用户旅程 (Write User Journeys)
```
作为 [角色]，我想要 [行动]，以便 [好处]

示例：
作为一名用户，我想要语义化搜索市场，
以便即使没有确切的关键词，我也可以找到相关的市场。
```

### 步骤 2: 生成测试用例 (Generate Test Cases)
对于每个用户旅程，创建全面的测试用例：

```typescript
describe('Semantic Search', () => {
  it('returns relevant markets for query', async () => {
    // Test implementation
  })

  it('handles empty query gracefully', async () => {
    // Test edge case
  })

  it('falls back to substring search when Redis unavailable', async () => {
    // Test fallback behavior
  })

  it('sorts results by similarity score', async () => {
    // Test sorting logic
  })
})
```

### 步骤 3: 运行测试 (它们应该失败) (Run Tests)
```bash
npm test
# 测试应该失败 - 我们还没实现
```

### 步骤 4: 实现代码 (Implement Code)
编写最少的代码以通过测试：

```typescript
// Implementation guided by tests
export async function searchMarkets(query: string) {
  // Implementation here
}
```

### 步骤 5: 再次运行测试 (Run Tests Again)
```bash
npm test
# 测试现在应该通过
```

### 步骤 6: 重构 (Refactor)
在保持测试通过的同时提高代码质量：
- 消除重复
- 改进命名
- 优化性能
- 增强可读性

### 步骤 7: 验证覆盖率 (Verify Coverage)
```bash
npm run test:coverage
# 验证达到 80%+ 覆盖率
```

## 测试模式 (Testing Patterns)

### 单元测试模式 (Jest/Vitest)
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### API 集成测试模式
```typescript
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/markets', () => {
  it('returns markets successfully', async () => {
    const request = new NextRequest('http://localhost/api/markets')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('validates query parameters', async () => {
    const request = new NextRequest('http://localhost/api/markets?limit=invalid')
    const response = await GET(request)

    expect(response.status).toBe(400)
  })

  it('handles database errors gracefully', async () => {
    // Mock database failure
    const request = new NextRequest('http://localhost/api/markets')
    // Test error handling
  })
})
```

### E2E 测试模式 (Playwright)
```typescript
import { test, expect } from '@playwright/test'

test('user can search and filter markets', async ({ page }) => {
  // Navigate to markets page
  await page.goto('/')
  await page.click('a[href="/markets"]')

  // Verify page loaded
  await expect(page.locator('h1')).toContainText('Markets')

  // Search for markets
  await page.fill('input[placeholder="Search markets"]', 'election')

  // Wait for debounce and results
  await page.waitForTimeout(600)

  // Verify search results displayed
  const results = page.locator('[data-testid="market-card"]')
  await expect(results).toHaveCount(5, { timeout: 5000 })

  // Verify results contain search term
  const firstResult = results.first()
  await expect(firstResult).toContainText('election', { ignoreCase: true })

  // Filter by status
  await page.click('button:has-text("Active")')

  // Verify filtered results
  await expect(results).toHaveCount(3)
})

test('user can create a new market', async ({ page }) => {
  // Login first
  await page.goto('/creator-dashboard')

  // Fill market creation form
  await page.fill('input[name="name"]', 'Test Market')
  await page.fill('textarea[name="description"]', 'Test description')
  await page.fill('input[name="endDate"]', '2025-12-31')

  // Submit form
  await page.click('button[type="submit"]')

  // Verify success message
  await expect(page.locator('text=Market created successfully')).toBeVisible()

  // Verify redirect to market page
  await expect(page).toHaveURL(/\/markets\/test-market/)
})
```

## 测试文件组织 (Test File Organization)

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx          # Unit tests
│   │   └── Button.stories.tsx       # Storybook
│   └── MarketCard/
│       ├── MarketCard.tsx
│       └── MarketCard.test.tsx
├── app/
│   └── api/
│       └── markets/
│           ├── route.ts
│           └── route.test.ts         # Integration tests
└── e2e/
    ├── markets.spec.ts               # E2E tests
    ├── trading.spec.ts
    └── auth.spec.ts
```

## Mock 外部服务 (Mocking External Services)

### Supabase Mock
```typescript
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: [{ id: 1, name: 'Test Market' }],
          error: null
        }))
      }))
    }))
  }
}))
```

### Redis Mock
```typescript
jest.mock('@/lib/redis', () => ({
  searchMarketsByVector: jest.fn(() => Promise.resolve([
    { slug: 'test-market', similarity_score: 0.95 }
  ])),
  checkRedisHealth: jest.fn(() => Promise.resolve({ connected: true }))
}))
```

### OpenAI Mock
```typescript
jest.mock('@/lib/openai', () => ({
  generateEmbedding: jest.fn(() => Promise.resolve(
    new Array(1536).fill(0.1) // Mock 1536-dim embedding
  ))
}))
```

## 测试覆盖率验证 (Test Coverage Verification)

### 运行覆盖率报告 (Run Coverage Report)
```bash
npm run test:coverage
```

### 覆盖率阈值 (Coverage Thresholds)
```json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## 要避免的常见测试错误 (Common Testing Mistakes to Avoid)

### ❌ WRONG: 测试实现细节
```typescript
// Don't test internal state
expect(component.state.count).toBe(5)
```

### ✅ CORRECT: 测试用户可见行为
```typescript
// Test what users see
expect(screen.getByText('Count: 5')).toBeInTheDocument()
```

### ❌ WRONG: 脆弱的选择器
```typescript
// Breaks easily
await page.click('.css-class-xyz')
```

### ✅ CORRECT: 语义化选择器
```typescript
// Resilient to changes
await page.click('button:has-text("Submit")')
await page.click('[data-testid="submit-button"]')
```

### ❌ WRONG: 无测试隔离
```typescript
// Tests depend on each other
test('creates user', () => { /* ... */ })
test('updates same user', () => { /* depends on previous test */ })
```

### ✅ CORRECT: 独立测试
```typescript
// Each test sets up its own data
test('creates user', () => {
  const user = createTestUser()
  // Test logic
})

test('updates user', () => {
  const user = createTestUser()
  // Update logic
})
```

## 持续测试 (Continuous Testing)

### 开发期间的监视模式 (Watch Mode During Development)
```bash
npm test -- --watch
# Tests run automatically on file changes
```

### 预提交 Hook (Pre-Commit Hook)
```bash
# Runs before every commit
npm test && npm run lint
```

### CI/CD 集成 (CI/CD Integration)
```yaml
# GitHub Actions
- name: Run Tests
  run: npm test -- --coverage
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## 最佳实践 (Best Practices)

1. **先写测试** - 始终 TDD
2. **每个测试一个断言** - 专注于单一行为
3. **描述性测试名称** - 解释测试内容
4. **Arrange-Act-Assert** - 清晰的测试结构
5. **Mock 外部依赖** - 隔离单元测试
6. **测试边缘情况** - Null, undefined, empty, large
7. **测试错误路径** - 不仅仅是快乐路径
8. **保持测试快速** - 单元测试每个 < 50ms
9. **测试后清理** - 无副作用
10. **审查覆盖率报告** - 识别差距

## 成功指标 (Success Metrics)

- 达到 80%+ 代码覆盖率
- 所有测试通过 (green)
- 没有跳过或禁用的测试
- 快速测试执行 (单元测试 < 30s)
- E2E 测试覆盖关键用户流程
- 测试在生产前捕获 Bug

---

**记住**：测试不是可选的。它们是安全网，能够实现自信的重构、快速开发和生产可靠性。
