# 安全指南 (Security Guidelines)

## 强制性安全检查 (Mandatory Security Checks)

在**任何**提交之前：
- [ ] 无硬编码的秘密（API 密钥、密码、令牌）
- [ ] 验证所有用户输入
- [ ] 防止 SQL 注入（参数化查询）
- [ ] 防止 XSS（清理 HTML）
- [ ] 启用 CSRF 保护
- [ ] 验证身份验证/授权
- [ ] 对所有端点进行速率限制
- [ ] 错误消息不泄露敏感数据

## 密钥管理 (Secret Management)

```typescript
// NEVER: Hardcoded secrets
const apiKey = "sk-proj-xxxxx"

// ALWAYS: Environment variables
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

## 安全响应协议 (Security Response Protocol)

如果发现安全问题：
1. 立即停止
2. 使用 **security-reviewer** agent
3. 在继续之前修复 CRITICAL (关键) 问题
4. 轮换任何暴露的密钥
5. 审查整个代码库是否存在类似问题
