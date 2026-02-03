# 代码风格 (Coding Style)

## 不可变性 (Immutability) - **关键**

始终创建新对象，**切勿**发生突变 (Mutation)：

```javascript
// WRONG: Mutation (突变)
function updateUser(user, name) {
  user.name = name  // MUTATION!
  return user
}

// CORRECT: Immutability (不可变)
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## 文件组织 (File Organization)

**许多小文件 > 少数大文件**：
- 高内聚，低耦合
- 典型 200-400 行，最大 800 行
- 从大型组件中提取工具函数
- 按功能/领域组织，而不是按类型

## 错误处理 (Error Handling)

始终全面处理错误：

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('操作失败:', error)
  throw new Error('详细的用户友好消息')
}
```

## 输入验证 (Input Validation)

始终验证用户输入：

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## 代码质量检查清单 (Code Quality Checklist)

在标记工作完成之前：
- [ ] 代码可读且命名良好
- [ ] 函数很小 (<50 行)
- [ ] 文件专注 (<800 行)
- [ ] 无深度嵌套 (>4 层)
- [ ] 适当的错误处理
- [ ] 无 console.log 语句
- [ ] 无硬编码值
- [ ] 无突变 (使用了不可变模式)
