---
name: security-review
description: 当添加身份验证、处理用户输入、使用密钥、创建 API 端点或实施支付/敏感功能时使用此技能。提供全面的安全检查清单和模式。
---

# 安全审查技能 (Security Review Skill)

此技能确保所有代码遵循安全最佳实践并识别潜在的漏洞。

## 何时激活 (When to Activate)

- 实施身份验证 (Authentication) 或授权 (Authorization)
- 处理用户输入或文件上传
- 创建新的 API 端点
- 处理密钥 (Secrets) 或凭证
- 实施支付功能
- 存储或传输敏感数据
- 集成第三方 API

## 安全检查清单 (Security Checklist)

### 1. 密钥管理 (Secrets Management)

#### ❌ 绝不这样做 (NEVER Do This)
```typescript
const apiKey = "sk-proj-xxxxx"  // 硬编码的密钥
const dbPassword = "password123" // 在源代码中
```

#### ✅ 始终这样做 (ALWAYS Do This)
```typescript
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

// 验证密钥是否存在
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

#### 验证步骤 (Verification Steps)
- [ ] 无硬编码的 API 密钥、令牌或密码
- [ ] 所有密钥都在环境变量中
- [ ] `.env.local` 已加入 .gitignore
- [ ] git 历史记录中无密钥
- [ ] 生产环境密钥在托管平台 (Vercel, Railway) 中配置

### 2. 输入验证 (Input Validation)

#### 始终验证用户输入 (Always Validate User Input)
```typescript
import { z } from 'zod'

// 定义验证模式
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

// 处理前进行验证
export async function createUser(input: unknown) {
  try {
    const validated = CreateUserSchema.parse(input)
    return await db.users.create(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors }
    }
    throw error
  }
}
```

#### 文件上传验证 (File Upload Validation)
```typescript
function validateFileUpload(file: File) {
  // 大小检查 (最大 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large (max 5MB)')
  }

  // 类型检查
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }

  // 扩展名检查
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error('Invalid file extension')
  }

  return true
}
```

#### 验证步骤 (Verification Steps)
- [ ] 所有用户输入都使用 Schema 验证
- [ ] 文件上传受限 (大小、类型、扩展名)
- [ ] 查询中不直接使用用户输入
- [ ] 白名单验证 (而非黑名单)
- [ ] 错误消息不泄露敏感信息

### 3. 防止 SQL 注入 (SQL Injection Prevention)

#### ❌ 绝不拼接 SQL (NEVER Concatenate SQL)
```typescript
// 危险 - SQL 注入漏洞
const query = `SELECT * FROM users WHERE email = '${userEmail}'`
await db.query(query)
```

#### ✅ 始终使用参数化查询 (ALWAYS Use Parameterized Queries)
```typescript
// 安全 - 参数化查询
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)

// 或者使用原始 SQL
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
)
```

#### 验证步骤 (Verification Steps)
- [ ] 所有数据库查询都使用参数化查询
- [ ] SQL 中无字符串拼接
- [ ] 正确使用 ORM/查询构建器
- [ ] Supabase 查询已正确清理

### 4. 身份验证与授权 (Authentication & Authorization)

#### JWT 令牌处理 (JWT Token Handling)
```typescript
// ❌ 错误: localStorage (容易受到 XSS 攻击)
localStorage.setItem('token', token)

// ✅ 正确: httpOnly cookies
res.setHeader('Set-Cookie',
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
```

#### 授权检查 (Authorization Checks)
```typescript
export async function deleteUser(userId: string, requesterId: string) {
  // 始终先验证授权
  const requester = await db.users.findUnique({
    where: { id: requesterId }
  })

  if (requester.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // 继续删除
  await db.users.delete({ where: { id: userId } })
}
```

#### 行级安全 (Row Level Security - Supabase)
```sql
-- 在所有表上启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的数据
CREATE POLICY "Users view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 用户只能更新自己的数据
CREATE POLICY "Users update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

#### 验证步骤 (Verification Steps)
- [ ] 令牌存储在 httpOnly cookies 中 (而非 localStorage)
- [ ] 敏感操作前进行授权检查
- [ ] 在 Supabase 中启用行级安全 (RLS)
- [ ] 实施基于角色的访问控制 (RBAC)
- [ ] 会话管理安全

### 5. 防止 XSS (XSS Prevention)

#### 清理 HTML (Sanitize HTML)
```typescript
import DOMPurify from 'isomorphic-dompurify'

// 始终清理用户提供的 HTML
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

#### 内容安全策略 (Content Security Policy)
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://api.example.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

#### 验证步骤 (Verification Steps)
- [ ] 用户提供的 HTML 已清理
- [ ] 配置了 CSP 标头
- [ ] 无未验证的动态内容渲染
- [ ] 使用了 React 内置的 XSS 保护

### 6. CSRF 保护 (CSRF Protection)

#### CSRF 令牌 (CSRF Tokens)
```typescript
import { csrf } from '@/lib/csrf'

export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token')

  if (!csrf.verify(token)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  // 处理请求
}
```

#### SameSite Cookies
```typescript
res.setHeader('Set-Cookie',
  `session=${sessionId}; HttpOnly; Secure; SameSite=Strict`)
```

#### 验证步骤 (Verification Steps)
- [ ] 状态更改操作上有 CSRF 令牌
- [ ] 所有 cookies 设置 SameSite=Strict
- [ ] 实施双重提交 cookie 模式

### 7. 速率限制 (Rate Limiting)

#### API 速率限制 (API Rate Limiting)
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个窗口 100 个请求
  message: 'Too many requests'
})

// 应用到路由
app.use('/api/', limiter)
```

#### 昂贵操作 (Expensive Operations)
```typescript
// 对搜索进行激进的速率限制
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 10, // 每分钟 10 个请求
  message: 'Too many search requests'
})

app.use('/api/search', searchLimiter)
```

#### 验证步骤 (Verification Steps)
- [ ] 所有 API 端点都有速率限制
- [ ] 对昂贵操作有更严格的限制
- [ ] 基于 IP 的速率限制
- [ ] 基于用户的速率限制 (已认证)

### 8. 敏感数据暴露 (Sensitive Data Exposure)

#### 日志记录 (Logging)
```typescript
// ❌ 错误: 记录敏感数据
console.log('User login:', { email, password })
console.log('Payment:', { cardNumber, cvv })

// ✅ 正确: 编校敏感数据
console.log('User login:', { email, userId })
console.log('Payment:', { last4: card.last4, userId })
```

#### 错误消息 (Error Messages)
```typescript
// ❌ 错误: 暴露内部细节
catch (error) {
  return NextResponse.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  )
}

// ✅ 正确: 通用错误消息
catch (error) {
  console.error('Internal error:', error)
  return NextResponse.json(
    { error: 'An error occurred. Please try again.' },
    { status: 500 }
  )
}
```

#### 验证步骤 (Verification Steps)
- [ ] 日志中无密码、令牌或密钥
- [ ] 用户看到的错误消息是通用的
- [ ] 详细错误仅在服务器日志中
- [ ] 不向用户暴露堆栈跟踪

### 9. 区块链安全 (Blockchain Security - Solana)

#### 钱包验证 (Wallet Verification)
```typescript
import { verify } from '@solana/web3.js'

async function verifyWalletOwnership(
  publicKey: string,
  signature: string,
  message: string
) {
  try {
    const isValid = verify(
      Buffer.from(message),
      Buffer.from(signature, 'base64'),
      Buffer.from(publicKey, 'base64')
    )
    return isValid
  } catch (error) {
    return false
  }
}
```

#### 交易验证 (Transaction Verification)
```typescript
async function verifyTransaction(transaction: Transaction) {
  // 验证接收者
  if (transaction.to !== expectedRecipient) {
    throw new Error('Invalid recipient')
  }

  // 验证金额
  if (transaction.amount > maxAmount) {
    throw new Error('Amount exceeds limit')
  }

  // 验证用户余额充足
  const balance = await getBalance(transaction.from)
  if (balance < transaction.amount) {
    throw new Error('Insufficient balance')
  }

  return true
}
```

#### 验证步骤 (Verification Steps)
- [ ] 验证钱包签名
- [ ] 验证交易详情
- [ ] 交易前检查余额
- [ ] 禁止盲签交易

### 10. 依赖项安全 (Dependency Security)

#### 定期更新 (Regular Updates)
```bash
# 检查漏洞
npm audit

# 修复可自动修复的问题
npm audit fix

# 更新依赖项
npm update

# 检查过时的包
npm outdated
```

#### 锁文件 (Lock Files)
```bash
# 始终提交锁文件
git add package-lock.json

# 在 CI/CD 中使用以获得可重现构建
npm ci  # 而不是 npm install
```

#### 验证步骤 (Verification Steps)
- [ ] 依赖项已更新
- [ ] 无已知漏洞 (npm audit clean)
- [ ] 锁文件已提交
- [ ] GitHub 上启用了 Dependabot
- [ ] 定期安全更新

## 安全测试 (Security Testing)

### 自动化安全测试 (Automated Security Tests)
```typescript
// 测试身份验证
test('requires authentication', async () => {
  const response = await fetch('/api/protected')
  expect(response.status).toBe(401)
})

// 测试授权
test('requires admin role', async () => {
  const response = await fetch('/api/admin', {
    headers: { Authorization: `Bearer ${userToken}` }
  })
  expect(response.status).toBe(403)
})

// 测试输入验证
test('rejects invalid input', async () => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email' })
  })
  expect(response.status).toBe(400)
})

// 测试速率限制
test('enforces rate limits', async () => {
  const requests = Array(101).fill(null).map(() =>
    fetch('/api/endpoint')
  )

  const responses = await Promise.all(requests)
  const tooManyRequests = responses.filter(r => r.status === 429)

  expect(tooManyRequests.length).toBeGreaterThan(0)
})
```

## 部署前安全检查清单 (Pre-Deployment Security Checklist)

在任何生产环境部署之前：

- [ ] **密钥**: 无硬编码密钥，全部在环境变量中
- [ ] **输入验证**: 所有用户输入均经过验证
- [ ] **SQL 注入**: 所有查询已参数化
- [ ] **XSS**: 用户内容已清理
- [ ] **CSRF**: 保护已启用
- [ ] **身份验证**: 正确的令牌处理
- [ ] **授权**: 角色检查就位
- [ ] **速率限制**: 所有端点已启用
- [ ] **HTTPS**: 生产环境中强制执行
- [ ] **安全标头**: 已配置 CSP, X-Frame-Options
- [ ] **错误处理**: 错误中无敏感数据
- [ ] **日志记录**: 未记录敏感数据
- [ ] **依赖项**: 最新，无漏洞
- [ ] **行级安全**: Supabase 中已启用
- [ ] **CORS**: 配置正确
- [ ] **文件上传**: 已验证 (大小、类型)
- [ ] **钱包签名**: 已验证 (如果涉及区块链)

## 资源 (Resources)

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/security)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Web Security Academy](https://portswigger.net/web-security)

---

**记住**: 安全不是可选的。一个漏洞可能会危及整个平台。如有疑问，请谨慎行事。
