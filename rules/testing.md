# 测试要求 (Testing Requirements)

## 最低测试覆盖率：80% (Minimum Test Coverage: 80%)

测试类型（全部必需）：
1. **单元测试 (Unit Tests)** - 单个函数、工具、组件
2. **集成测试 (Integration Tests)** - API 端点、数据库操作
3. **E2E 测试 (E2E Tests)** - 关键用户流程 (Playwright)

## 测试驱动开发 (Test-Driven Development)

强制工作流 (MANDATORY workflow)：
1. 先写测试 (RED)
2. 运行测试 - 它应该失败 (FAIL)
3. 编写最少的实现 (GREEN)
4. 运行测试 - 它应该通过 (PASS)
5. 重构 (IMPROVE)
6. 验证覆盖率 (80%+)

## 测试失败故障排除 (Troubleshooting Test Failures)

1. 使用 **tdd-guide** agent
2. 检查测试隔离性
3. 验证 mock 是否正确
4. 修复实现，而不是测试（除非测试有误）

## Agent 支持 (Agent Support)

- **tdd-guide** - 主动用于新功能，强制执行先写测试
- **e2e-runner** - Playwright E2E 测试专家
