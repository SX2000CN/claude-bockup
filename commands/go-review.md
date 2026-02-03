---
description: 全面的 Go 代码审查，检查地道模式、并发安全、错误处理和安全性。调用 go-reviewer agent。
---

# Go 代码审查 (Go Code Review)

此命令调用 **go-reviewer** agent 进行全面的 Go 特定代码审查。

## 此命令做什么 (What This Command Does)

1. **识别 Go 更改**：通过 `git diff` 查找修改过的 `.go` 文件
2. **运行静态分析**：执行 `go vet`, `staticcheck`, 和 `golangci-lint`
3. **安全扫描**：检查 SQL 注入、命令注入、竞态条件
4. **并发审查**：分析 goroutine 安全性、通道使用、互斥锁模式
5. **地道 Go 检查**：验证代码是否遵循 Go 约定和最佳实践
6. **生成报告**：按严重程度对问题进行分类

## 何时使用 (When to Use)

在以下情况使用 `/go-review`：
- 编写或修改 Go 代码后
- 提交 Go 更改前
- 审查包含 Go 代码的 Pull Request 时
- 接手新的 Go 代码库时
- 学习地道的 Go 模式时

## 审查类别 (Review Categories)

### 严重 (CRITICAL - 必须修复)
- SQL/命令注入漏洞
- 无同步的竞态条件
- Goroutine 泄露
- 硬编码凭据
- 不安全的指针使用
- 忽略关键路径中的错误

### 高 (HIGH - 应该修复)
- 缺少带上下文的错误包装
- 使用 panic 代替错误返回
- Context 未传播
- 无缓冲通道导致死锁
- 接口未满足错误
- 缺少互斥锁保护

### 中 (MEDIUM - 考虑修复)
- 非地道代码模式
- 导出函数缺少 godoc 注释
- 低效的字符串拼接
- Slice 未预分配
- 未使用表格驱动测试

## 运行的自动检查 (Automated Checks Run)

```bash
# 静态分析
go vet ./...

# 高级检查 (如果已安装)
staticcheck ./...
golangci-lint run

# 竞态检测
go build -race ./...

# 安全漏洞
govulncheck ./...
```

## 示例用法 (Example Usage)

```text
User: /go-review

Agent:
# Go 代码审查报告 (Go Code Review Report)

## 审查的文件
- internal/handler/user.go (modified)
- internal/service/auth.go (modified)

## 静态分析结果
✓ go vet: 无问题
✓ staticcheck: 无问题

## 发现的问题

[CRITICAL] 竞态条件
文件: internal/service/auth.go:45
问题: 无同步访问共享 map
```go
var cache = map[string]*Session{}  // 并发访问!

func GetSession(id string) *Session {
    return cache[id]  // 竞态条件
}
```
修复: 使用 sync.RWMutex 或 sync.Map
```go
var (
    cache   = map[string]*Session{}
    cacheMu sync.RWMutex
)

func GetSession(id string) *Session {
    cacheMu.RLock()
    defer cacheMu.RUnlock()
    return cache[id]
}
```

[HIGH] 缺少错误上下文
文件: internal/handler/user.go:28
问题: 返回错误时无上下文
```go
return err  // 无上下文
```
修复: 使用上下文包装
```go
return fmt.Errorf("get user %s: %w", userID, err)
```

## 摘要
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

建议: ❌ 在修复 CRITICAL 问题前阻止合并
```

## 批准标准 (Approval Criteria)

| 状态 | 条件 |
|--------|-----------|
| ✅ 批准 (Approve) | 无 CRITICAL 或 HIGH 问题 |
| ⚠️ 警告 (Warning) | 仅有 MEDIUM 问题 (谨慎合并) |
| ❌ 拒绝 (Block) | 发现 CRITICAL 或 HIGH 问题 |

## 与其他命令集成 (Integration)

- 先使用 `/go-test` 确保测试通过
- 如果出现构建错误，使用 `/go-build`
- 在提交前使用 `/go-review`
- 对于非 Go 特定的关注点，使用 `/code-review`

## 相关资源

- Agent: `agents/go-reviewer.md`
- Skills: `skills/golang-patterns/`, `skills/golang-testing/`
