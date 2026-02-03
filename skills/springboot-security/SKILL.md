---
name: springboot-security
description: Java Spring Boot 服务的身份验证/授权、验证、CSRF、密钥、标头、速率限制和依赖项安全的最佳实践。
---

# Spring Boot 安全审查 (Spring Boot Security Review)

在添加身份验证、处理输入、创建端点或处理密钥时使用。

## 身份验证 (Authentication)

- 优先使用无状态 JWT 或带有撤销列表的不透明令牌 (opaque tokens)
- 使用 `httpOnly`, `Secure`, `SameSite=Strict` cookie 进行会话管理
- 使用 `OncePerRequestFilter` 或资源服务器验证令牌

```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  private final JwtService jwtService;

  public JwtAuthFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain chain) throws ServletException, IOException {
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7);
      Authentication auth = jwtService.authenticate(token);
      SecurityContextHolder.getContext().setAuthentication(auth);
    }
    chain.doFilter(request, response);
  }
}
```

## 授权 (Authorization)

- 启用方法安全: `@EnableMethodSecurity`
- 使用 `@PreAuthorize("hasRole('ADMIN')")` 或 `@PreAuthorize("@authz.canEdit(#id)")`
- 默认拒绝；仅公开所需的范围 (scopes)

## 输入验证 (Input Validation)

- 在控制器上使用 `@Valid` 进行 Bean 验证
- 在 DTO 上应用约束: `@NotBlank`, `@Email`, `@Size`, 自定义验证器
- 渲染前使用白名单清理任何 HTML

## 防止 SQL 注入 (SQL Injection Prevention)

- 使用 Spring Data 存储库或参数化查询
- 对于原生查询，使用 `:param` 绑定；切勿拼接字符串

## CSRF 保护 (CSRF Protection)

- 对于浏览器会话应用，保持启用 CSRF；在表单/标头中包含令牌
- 对于带有 Bearer 令牌的纯 API，禁用 CSRF 并依赖无状态认证

```java
http
  .csrf(csrf -> csrf.disable())
  .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
```

## 密钥管理 (Secrets Management)

- 源代码中无密钥；从环境变量或 Vault 加载
- 保持 `application.yml` 不包含凭据；使用占位符
- 定期轮换令牌和数据库凭据

## 安全标头 (Security Headers)

```java
http
  .headers(headers -> headers
    .contentSecurityPolicy(csp -> csp
      .policyDirectives("default-src 'self'"))
    .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
    .xssProtection(Customizer.withDefaults())
    .referrerPolicy(rp -> rp.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER)));
```

## 速率限制 (Rate Limiting)

- 在昂贵的端点上应用 Bucket4j 或网关级限制
- 记录并警报突发流量；返回 429 并带有重试提示

## 依赖项安全 (Dependency Security)

- 在 CI 中运行 OWASP Dependency Check / Snyk
- 保持 Spring Boot 和 Spring Security 在受支持的版本上
- 发现已知 CVE 时构建失败

## 日志记录和 PII (Logging and PII)

- 绝不记录密钥、令牌、密码或完整的 PAN 数据
- 编校敏感字段；使用结构化 JSON 日志记录

## 文件上传 (File Uploads)

- 验证大小、内容类型和扩展名
- 存储在 Web 根目录之外；如果需要则进行扫描

## 发布前检查清单 (Checklist Before Release)

- [ ] 认证令牌已正确验证和过期
- [ ] 每个敏感路径上都有授权防护
- [ ] 所有输入都经过验证和清理
- [ ] 无字符串拼接的 SQL
- [ ] 针对应用类型正确配置了 CSRF
- [ ] 密钥已外部化；无提交的密钥
- [ ] 已配置安全标头
- [ ] API 上的速率限制
- [ ] 依赖项已扫描并更新
- [ ] 日志中无敏感数据

**记住**: 默认拒绝，验证输入，最小权限，并优先通过配置保证安全。
