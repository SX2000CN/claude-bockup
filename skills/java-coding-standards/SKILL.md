---
name: java-coding-standards
description: Spring Boot 服务的 Java 编码标准：命名、不变性、Optional 使用、流、异常、泛型和项目布局。
---

# Java 编码标准 (Java Coding Standards)

Spring Boot 服务中可读、可维护的 Java (17+) 代码标准。

## 核心原则 (Core Principles)

- 清晰优于聪明
- 默认不可变；尽量减少共享可变状态
- 快速失败并提供有意义的异常
- 一致的命名和包结构

## 命名 (Naming)

```java
// ✅ 类/记录: PascalCase (大驼峰)
public class MarketService {}
public record Money(BigDecimal amount, Currency currency) {}

// ✅ 方法/字段: camelCase (小驼峰)
private final MarketRepository marketRepository;
public Market findBySlug(String slug) {}

// ✅ 常量: UPPER_SNAKE_CASE (大写下划线)
private static final int MAX_PAGE_SIZE = 100;
```

## 不变性 (Immutability)

```java
// ✅ 优先使用 Record 和 final 字段
public record MarketDto(Long id, String name, MarketStatus status) {}

public class Market {
  private final Long id;
  private final String name;
  // 只有 getter，没有 setter
}
```

## Optional 使用 (Optional Usage)

```java
// ✅ 从 find* 方法返回 Optional
Optional<Market> market = marketRepository.findBySlug(slug);

// ✅ 使用 map/flatMap 而不是 get()
return market
    .map(MarketResponse::from)
    .orElseThrow(() -> new EntityNotFoundException("Market not found"));
```

## Stream 最佳实践 (Streams Best Practices)

```java
// ✅ 使用 Stream 进行转换，保持管道简短
List<String> names = markets.stream()
    .map(Market::name)
    .filter(Objects::nonNull)
    .toList();

// ❌ 避免复杂的嵌套 Stream；为了清晰起见，优先使用循环
```

## 异常 (Exceptions)

- 对领域错误使用非受检异常 (Unchecked Exceptions)；将技术异常包装在上下文中
- 创建特定领域的异常 (例如 `MarketNotFoundException`)
- 避免宽泛的 `catch (Exception ex)`，除非是集中重新抛出或记录日志

```java
throw new MarketNotFoundException(slug);
```

## 泛型和类型安全 (Generics and Type Safety)

- 避免原类型 (Raw Types)；声明泛型参数
- 对于可重用的工具，优先使用有界泛型

```java
public <T extends Identifiable> Map<Long, T> indexById(Collection<T> items) { ... }
```

## 项目结构 (Maven/Gradle)

```
src/main/java/com/example/app/
  config/
  controller/
  service/
  repository/
  domain/
  dto/
  util/
src/main/resources/
  application.yml
src/test/java/... (镜像 main 目录)
```

## 格式和风格 (Formatting and Style)

- 始终使用 2 或 4 个空格 (项目标准)
- 每个文件一个公共顶级类型
- 保持方法简短且专注；提取辅助方法
- 成员顺序：常量、字段、构造函数、公共方法、受保护方法、私有方法

## 避免的代码异味 (Code Smells to Avoid)

- 长参数列表 → 使用 DTO/构建器
- 深度嵌套 → 尽早返回 (Early returns)
- 魔术数字 → 命名常量
- 静态可变状态 → 优先使用依赖注入
- 沉默的 catch 块 → 记录并处理或重新抛出

## 日志记录 (Logging)

```java
private static final Logger log = LoggerFactory.getLogger(MarketService.class);
log.info("fetch_market slug={}", slug);
log.error("failed_fetch_market slug={}", slug, ex);
```

## 空处理 (Null Handling)

- 仅在不可避免时接受 `@Nullable`；否则使用 `@NonNull`
- 对输入使用 Bean Validation (`@NotNull`, `@NotBlank`)

## 测试期望 (Testing Expectations)

- JUnit 5 + AssertJ 用于流畅断言
- Mockito 用于模拟；尽可能避免部分模拟 (Partial mocks)
- 倾向于确定性测试；无隐藏的 sleep

**记住**: 保持代码意图明确、类型化和可观察。除非必要，否则优先考虑可维护性而不是微优化。
