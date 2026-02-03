---
name: springboot-verification
description: Spring Boot 项目的验证循环：构建、静态分析、带覆盖率的测试、安全扫描和发布或 PR 前的差异审查。
---

# Spring Boot 验证循环 (Spring Boot Verification Loop)

在 PR 之前、重大更改之后和部署之前运行。

## 第 1 阶段：构建 (Phase 1: Build)

```bash
mvn -T 4 clean verify -DskipTests
# 或者
./gradlew clean assemble -x test
```

如果构建失败，停止并修复。

## 第 2 阶段：静态分析 (Phase 2: Static Analysis)

Maven (常用插件):
```bash
mvn -T 4 spotbugs:check pmd:check checkstyle:check
```

Gradle (如果已配置):
```bash
./gradlew checkstyleMain pmdMain spotbugsMain
```

## 第 3 阶段：测试 + 覆盖率 (Phase 3: Tests + Coverage)

```bash
mvn -T 4 test
mvn jacoco:report   # 验证 80%+ 覆盖率
# 或者
./gradlew test jacocoTestReport
```

报告:
- 总测试数，通过/失败
- 覆盖率 % (行/分支)

## 第 4 阶段：安全扫描 (Phase 4: Security Scan)

```bash
# 依赖项 CVEs
mvn org.owasp:dependency-check-maven:check
# 或者
./gradlew dependencyCheckAnalyze

# 密钥 (git)
git secrets --scan  # 如果已配置
```

## 第 5 阶段：Lint/格式化 (可选门禁) (Phase 5: Lint/Format)

```bash
mvn spotless:apply   # 如果使用 Spotless 插件
./gradlew spotlessApply
```

## 第 6 阶段：差异审查 (Phase 6: Diff Review)

```bash
git diff --stat
git diff
```

检查清单:
- 没有遗留的调试日志 (`System.out`, 无保护的 `log.debug`)
- 有意义的错误和 HTTP 状态
- 需要的地方有事务和验证
- 配置更改已记录

## 输出模板 (Output Template)

```
VERIFICATION REPORT
===================
Build:     [PASS/FAIL]
Static:    [PASS/FAIL] (spotbugs/pmd/checkstyle)
Tests:     [PASS/FAIL] (X/Y passed, Z% coverage)
Security:  [PASS/FAIL] (CVE findings: N)
Diff:      [X files changed]

Overall:   [READY / NOT READY]

Issues to Fix:
1. ...
2. ...
```

## 持续模式 (Continuous Mode)

- 在重大更改或长时间会话中每 30–60 分钟重新运行各阶段
- 保持短循环：`mvn -T 4 test` + spotbugs 以获得快速反馈

**记住**: 快速反馈胜过迟来的惊喜。保持门禁严格——将警告视为生产系统中的缺陷。
