---
name: coding-standards
description: 适用于 TypeScript、JavaScript、React 和 Node.js 开发的通用编码标准、最佳实践和模式。
---

# 编码标准与最佳实践 (Coding Standards & Best Practices)

适用于所有项目的通用编码标准。

## 代码质量原则 (Code Quality Principles)

### 1. 可读性优先 (Readability First)
- 代码被阅读的次数远多于被编写的次数
- 清晰的变量和函数命名
- 优先选择自文档化的代码，而不是注释
- 统一的格式化

### 2. KISS (Keep It Simple, Stupid) - 保持简单
- 使用能工作的最简单解决方案
- 避免过度设计
- 没有过早的优化
- 易于理解 > 聪明的代码

### 3. DRY (Don't Repeat Yourself) - 不要重复自己
- 将通用逻辑提取到函数中
- 创建可重用的组件
- 跨模块共享工具
- 避免复制粘贴编程

### 4. YAGNI (You Aren't Gonna Need It) - 你不会需要它
- 不要在这个功能被需要之前构建它
- 避免推测性的通用性
- 仅在需要时添加复杂性
- 从简单开始，需要时重构

## TypeScript/JavaScript 标准

### 变量命名 (Variable Naming)

```typescript
// ✅ GOOD: 描述性名称
const marketSearchQuery = 'election'
const isUserAuthenticated = true
const totalRevenue = 1000

// ❌ BAD: 不清楚的名称
const q = 'election'
const flag = true
const x = 1000
```

### 函数命名 (Function Naming)

```typescript
// ✅ GOOD: 动词-名词模式
async function fetchMarketData(marketId: string) { }
function calculateSimilarity(a: number[], b: number[]) { }
function isValidEmail(email: string): boolean { }

// ❌ BAD: 不清楚或仅名词
async function market(id: string) { }
function similarity(a, b) { }
function email(e) { }
```

### 不可变模式 (Immutability Pattern) - **关键**

```typescript
// ✅ 始终使用展开运算符
const updatedUser = {
  ...user,
  name: 'New Name'
}

const updatedArray = [...items, newItem]

// ❌ 永远不要直接突变
user.name = 'New Name'  // BAD
items.push(newItem)     // BAD
```

### 错误处理 (Error Handling)

```typescript
// ✅ GOOD: 全面的错误处理
async function fetchData(url: string) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    throw new Error('Failed to fetch data')
  }
}

// ❌ BAD: 无错误处理
async function fetchData(url) {
  const response = await fetch(url)
  return response.json()
}
```

### Async/Await 最佳实践

```typescript
// ✅ GOOD: 尽可能并行执行
const [users, markets, stats] = await Promise.all([
  fetchUsers(),
  fetchMarkets(),
  fetchStats()
])

// ❌ BAD: 不必要的顺序执行
const users = await fetchUsers()
const markets = await fetchMarkets()
const stats = await fetchStats()
```

### 类型安全 (Type Safety)

```typescript
// ✅ GOOD: 适当的类型
interface Market {
  id: string
  name: string
  status: 'active' | 'resolved' | 'closed'
  created_at: Date
}

function getMarket(id: string): Promise<Market> {
  // Implementation
}

// ❌ BAD: 使用 'any'
function getMarket(id: any): Promise<any> {
  // Implementation
}
```

## React 最佳实践

### 组件结构 (Component Structure)

```typescript
// ✅ GOOD: 带类型的函数式组件
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}

// ❌ BAD: 无类型，结构不清晰
export function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>
}
```

### 自定义 Hooks (Custom Hooks)

```typescript
// ✅ GOOD: 可重用的自定义 hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// Usage
const debouncedQuery = useDebounce(searchQuery, 500)
```

### 状态管理 (State Management)

```typescript
// ✅ GOOD: 正确的状态更新
const [count, setCount] = useState(0)

// 基于先前状态的函数式更新
setCount(prev => prev + 1)

// ❌ BAD: 直接状态引用
setCount(count + 1)  // 在异步场景中可能会过时
```

### 条件渲染 (Conditional Rendering)

```typescript
// ✅ GOOD: 清晰的条件渲染
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// ❌ BAD: 三元运算符地狱
{isLoading ? <Spinner /> : error ? <ErrorMessage error={error} /> : data ? <DataDisplay data={data} /> : null}
```

## API 设计标准

### REST API 约定

```
GET    /api/markets              # List all markets
GET    /api/markets/:id          # Get specific market
POST   /api/markets              # Create new market
PUT    /api/markets/:id          # Update market (full)
PATCH  /api/markets/:id          # Update market (partial)
DELETE /api/markets/:id          # Delete market

# Query parameters for filtering
GET /api/markets?status=active&limit=10&offset=0
```

### 响应格式 (Response Format)

```typescript
// ✅ GOOD: 一致的响应结构
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// Success response
return NextResponse.json({
  success: true,
  data: markets,
  meta: { total: 100, page: 1, limit: 10 }
})

// Error response
return NextResponse.json({
  success: false,
  error: 'Invalid request'
}, { status: 400 })
```

### 输入验证 (Input Validation)

```typescript
import { z } from 'zod'

// ✅ GOOD: Schema 验证
const CreateMarketSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  endDate: z.string().datetime(),
  categories: z.array(z.string()).min(1)
})

export async function POST(request: Request) {
  const body = await request.json()

  try {
    const validated = CreateMarketSchema.parse(body)
    // Proceed with validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }
  }
}
```

## 文件组织 (File Organization)

### 项目结构 (Project Structure)

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── markets/           # Market pages
│   └── (auth)/           # Auth pages (route groups)
├── components/            # React components
│   ├── ui/               # Generic UI components
│   ├── forms/            # Form components
│   └── layouts/          # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configs
│   ├── api/             # API clients
│   ├── utils/           # Helper functions
│   └── constants/       # Constants
├── types/                # TypeScript types
└── styles/              # Global styles
```

### 文件命名 (File Naming)

```
components/Button.tsx          # PascalCase for components
hooks/useAuth.ts              # camelCase with 'use' prefix
lib/formatDate.ts             # camelCase for utilities
types/market.types.ts         # camelCase with .types suffix
```

## 注释与文档 (Comments & Documentation)

### 何时注释 (When to Comment)

```typescript
// ✅ GOOD: 解释“为什么”，而不是“是什么”
// Use exponential backoff to avoid overwhelming the API during outages
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// Deliberately using mutation here for performance with large arrays
items.push(newItem)

// ❌ BAD: 陈述显而易见的事实
// Increment counter by 1
count++

// Set name to user's name
name = user.name
```

### 公共 API 的 JSDoc

```typescript
/**
 * Searches markets using semantic similarity.
 *
 * @param query - Natural language search query
 * @param limit - Maximum number of results (default: 10)
 * @returns Array of markets sorted by similarity score
 * @throws {Error} If OpenAI API fails or Redis unavailable
 *
 * @example
 * ```typescript
 * const results = await searchMarkets('election', 5)
 * console.log(results[0].name) // "Trump vs Biden"
 * ```
 */
export async function searchMarkets(
  query: string,
  limit: number = 10
): Promise<Market[]> {
  // Implementation
}
```

## 性能最佳实践 (Performance Best Practices)

### 记忆化 (Memoization)

```typescript
import { useMemo, useCallback } from 'react'

// ✅ GOOD: 记忆昂贵的计算
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume)
}, [markets])

// ✅ GOOD: 记忆回调函数
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])
```

### 懒加载 (Lazy Loading)

```typescript
import { lazy, Suspense } from 'react'

// ✅ GOOD: 懒加载重型组件
const HeavyChart = lazy(() => import('./HeavyChart'))

export function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  )
}
```

### 数据库查询 (Database Queries)

```typescript
// ✅ GOOD: 仅选择所需的列
const { data } = await supabase
  .from('markets')
  .select('id, name, status')
  .limit(10)

// ❌ BAD: 选择所有内容
const { data } = await supabase
  .from('markets')
  .select('*')
```

## 测试标准 (Testing Standards)

### 测试结构 (AAA 模式)

```typescript
test('calculates similarity correctly', () => {
  // Arrange (准备)
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act (执行)
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert (断言)
  expect(similarity).toBe(0)
})
```

### 测试命名 (Test Naming)

```typescript
// ✅ GOOD: 描述性测试名称
test('returns empty array when no markets match query', () => { })
test('throws error when OpenAI API key is missing', () => { })
test('falls back to substring search when Redis unavailable', () => { })

// ❌ BAD: 模糊的测试名称
test('works', () => { })
test('test search', () => { })
```

## 代码异味检测 (Code Smell Detection)

注意这些反模式：

### 1. 长函数 (Long Functions)
```typescript
// ❌ BAD: Function > 50 lines
function processMarketData() {
  // 100 lines of code
}

// ✅ GOOD: Split into smaller functions
function processMarketData() {
  const validated = validateData()
  const transformed = transformData(validated)
  return saveData(transformed)
}
```

### 2. 深度嵌套 (Deep Nesting)
```typescript
// ❌ BAD: 5+ levels of nesting
if (user) {
  if (user.isAdmin) {
    if (market) {
      if (market.isActive) {
        if (hasPermission) {
          // Do something
        }
      }
    }
  }
}

// ✅ GOOD: Early returns
if (!user) return
if (!user.isAdmin) return
if (!market) return
if (!market.isActive) return
if (!hasPermission) return

// Do something
```

### 3. 魔术数字 (Magic Numbers)
```typescript
// ❌ BAD: Unexplained numbers
if (retryCount > 3) { }
setTimeout(callback, 500)

// ✅ GOOD: Named constants
const MAX_RETRIES = 3
const DEBOUNCE_DELAY_MS = 500

if (retryCount > MAX_RETRIES) { }
setTimeout(callback, DEBOUNCE_DELAY_MS)
```

**记住**：代码质量是不可协商的。清晰、可维护的代码能够实现快速开发和自信的重构。
