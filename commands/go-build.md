---
description: 增量修复 Go 构建错误、go vet 警告和 linter 问题。调用 go-build-resolver agent 进行最小化的外科手术式修复。
---

# Go 构建修复 (Go Build and Fix)

此命令调用 **go-build-resolver** agent 以增量方式修复 Go 构建错误，且仅做最小的更改。

## 此命令做什么 (What This Command Does)

1. **运行诊断**：执行 `go build`, `go vet`, `staticcheck`
2. **解析错误**：按文件分组并按严重程度排序
3. **增量修复**：一次修复一个错误
4. **验证修复**：每次更改后重新运行构建
5. **报告摘要**：显示已修复的内容和剩余的问题

## 何时使用 (When to Use)

在以下情况使用 `/go-build`：
- `go build ./...` 失败并报错
- `go vet ./...` 报告问题
- `golangci-lint run` 显示警告
- 模块依赖关系损坏
- 拉取破坏构建的更改后

## 运行的诊断命令 (Diagnostic Commands Run)

```bash
# 主要构建检查
go build ./...

# 静态分析
go vet ./...

# 扩展 Linting (如果可用)
staticcheck ./...
golangci-lint run

# 模块问题
go mod verify
go mod tidy -v
```

## 示例会话 (Example Session)

```text
User: /go-build

Agent:
# Go 构建解析 (Go Build Resolution)

## 初始诊断

```bash
$ go build ./...
internal/service/user.go:25:15: undefined: UserRepository
internal/handler/api.go:42:9: cannot use x (type string) as type int
internal/handler/api.go:58:2: missing return at end of function
```

发现错误数: 3

## 修复 1: 未定义的标识符

文件: internal/service/user.go:25
错误: undefined: UserRepository
原因: 缺少导入

```go
// 添加了导入
import "project/internal/repository"

// 修改前
var repo UserRepository
// 修改后
var repo repository.UserRepository
```

```bash
$ go build ./...
# 剩余 2 个错误
```

## 修复 2: 类型不匹配

文件: internal/handler/api.go:42
错误: cannot use x (type string) as type int

```go
// 修改前
count := params.Get("count")
// 修改后
countStr := params.Get("count")
count, _ := strconv.Atoi(countStr)
```

```bash
$ go build ./...
# 剩余 1 个错误
```

## 修复 3: 缺少返回值

文件: internal/handler/api.go:58
错误: missing return at end of function

```go
func GetUser(id string) (*User, error) {
    if id == "" {
        return nil, ErrInvalidID
    }
    user := findUser(id)
    // 添加了缺失的返回
    return user, nil
}
```

```bash
$ go build ./...
# 构建成功!
```

## 最终验证

```bash
$ go vet ./...
# 无问题

$ go test ./...
ok      project/internal/service   0.015s
ok      project/internal/handler   0.023s
```

## 摘要

| 指标 | 计数 |
|--------|-------|
| 已修复的构建错误 | 3 |
| 已修复的 Vet 警告 | 0 |
| 修改的文件 | 2 |
| 剩余问题 | 0 |

构建状态: ✅ 成功
```

## 常见修复错误 (Common Errors Fixed)

| 错误 | 典型修复 |
|-------|-------------|
| `undefined: X` | 添加导入或修复拼写错误 |
| `cannot use X as Y` | 类型转换或修复赋值 |
| `missing return` | 添加返回语句 |
| `X does not implement Y` | 添加缺失的方法 |
| `import cycle` | 重组包结构 |
| `declared but not used` | 移除或使用变量 |
| `cannot find package` | `go get` 或 `go mod tidy` |

## 修复策略 (Fix Strategy)

1. **构建错误优先** - 代码必须能编译
2. **Vet 警告其次** - 修复可疑的构造
3. **Lint 警告最后** - 风格和最佳实践
4. **一次修复一个** - 验证每次更改
5. **最小更改** - 不要重构，只修复

## 停止条件 (Stop Conditions)

Agent 在以下情况下会停止并报告：
- 同一错误在 3 次尝试后仍然存在
- 修复引入了比解决的更多的错误
- 需要架构更改
- 缺少外部依赖

## 相关命令 (Related Commands)

- `/go-test` - 构建成功后运行测试
- `/go-review` - 审查代码质量
- `/verify` - 全面验证循环

## 相关资源

- Agent: `agents/go-build-resolver.md`
- Skill: `skills/golang-patterns/`
