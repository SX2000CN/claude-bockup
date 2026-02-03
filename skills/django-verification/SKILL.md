---
name: django-verification
description: Django 项目的验证循环：迁移、Linting、带覆盖率的测试、安全扫描和发布或 PR 前的部署准备检查。
---

# Django 验证循环 (Django Verification Loop)

在 PR 之前、重大更改之后和部署之前运行，以确保 Django 应用程序的质量和安全性。

## 第 1 阶段：环境检查 (Phase 1: Environment Check)

```bash
# 验证 Python 版本
python --version  # 应匹配项目要求

# 检查虚拟环境
which python
pip list --outdated

# 验证环境变量
python -c "import os; import environ; print('DJANGO_SECRET_KEY set' if os.environ.get('DJANGO_SECRET_KEY') else 'MISSING: DJANGO_SECRET_KEY')"
```

如果环境配置错误，停止并修复。

## 第 2 阶段：代码质量与格式化 (Phase 2: Code Quality & Formatting)

```bash
# 类型检查
mypy . --config-file pyproject.toml

# 使用 ruff 进行 Linting
ruff check . --fix

# 使用 black 进行格式化
black . --check
black .  # 自动修复

# 导入排序
isort . --check-only
isort .  # 自动修复

# Django 特定检查
python manage.py check --deploy
```

常见问题：
- 公共函数缺少类型提示
- PEP 8 格式违规
- 未排序的导入
- 生产配置中保留了调试设置

## 第 3 阶段：迁移 (Phase 3: Migrations)

```bash
# 检查未应用的迁移
python manage.py showmigrations

# 创建缺失的迁移
python manage.py makemigrations --check

# 模拟迁移应用 (Dry-run)
python manage.py migrate --plan

# 应用迁移 (测试环境)
python manage.py migrate

# 检查迁移冲突
python manage.py makemigrations --merge  # 仅当存在冲突时
```

报告：
- 待处理迁移的数量
- 任何迁移冲突
- 没有迁移的模型更改

## 第 4 阶段：测试 + 覆盖率 (Phase 4: Tests + Coverage)

```bash
# 使用 pytest 运行所有测试
pytest --cov=apps --cov-report=html --cov-report=term-missing --reuse-db

# 运行特定应用的测试
pytest apps/users/tests/

# 运行带有标记的测试
pytest -m "not slow"  # 跳过慢测试
pytest -m integration  # 仅集成测试

# 覆盖率报告
open htmlcov/index.html
```

报告：
- 总测试数：X 通过，Y 失败，Z 跳过
- 总体覆盖率：XX%
- 每个应用的覆盖率细分

覆盖率目标：

| 组件 | 目标 |
|-----------|--------|
| 模型 (Models) | 90%+ |
| 序列化器 (Serializers) | 85%+ |
| 视图 (Views) | 80%+ |
| 服务 (Services) | 90%+ |
| 总体 (Overall) | 80%+ |

## 第 5 阶段：安全扫描 (Phase 5: Security Scan)

```bash
# 依赖项漏洞
pip-audit
safety check --full-report

# Django 安全检查
python manage.py check --deploy

# Bandit 安全 linter
bandit -r . -f json -o bandit-report.json

# 密钥扫描 (如果安装了 gitleaks)
gitleaks detect --source . --verbose

# 环境变量检查
python -c "from django.core.exceptions import ImproperlyConfigured; from django.conf import settings; settings.DEBUG"
```

报告：
- 发现的易受攻击的依赖项
- 安全配置问题
- 检测到的硬编码密钥
- DEBUG 模式状态 (生产环境中应为 False)

## 第 6 阶段：Django 管理命令 (Phase 6: Django Management Commands)

```bash
# 检查模型问题
python manage.py check

# 收集静态文件
python manage.py collectstatic --noinput --clear

# 创建超级用户 (如果测试需要)
echo "from apps.users.models import User; User.objects.create_superuser('admin@example.com', 'admin')" | python manage.py shell

# 数据库完整性
python manage.py check --database default

# 缓存验证 (如果使用 Redis)
python -c "from django.core.cache import cache; cache.set('test', 'value', 10); print(cache.get('test'))"
```

## 第 7 阶段：性能检查 (Phase 7: Performance Checks)

```bash
# Django Debug Toolbar 输出 (检查 N+1 查询)
# 在 DEBUG=True 的开发模式下运行并访问页面
# 在 SQL 面板中查找重复查询

# 查询计数分析
django-admin debugsqlshell  # 如果安装了 django-debug-sqlshell

# 检查缺失的索引
python manage.py shell << EOF
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("SELECT table_name, index_name FROM information_schema.statistics WHERE table_schema = 'public'")
    print(cursor.fetchall())
EOF
```

报告：
- 每页查询数 (典型页面应 < 50)
- 缺失的数据库索引
- 检测到的重复查询

## 第 8 阶段：静态资产 (Phase 8: Static Assets)

```bash
# 检查 npm 依赖项 (如果使用 npm)
npm audit
npm audit fix

# 构建静态文件 (如果使用 webpack/vite)
npm run build

# 验证静态文件
ls -la staticfiles/
python manage.py findstatic css/style.css
```

## 第 9 阶段：配置审查 (Phase 9: Configuration Review)

```python
# 在 Python shell 中运行以验证设置
python manage.py shell << EOF
from django.conf import settings
import os

# 关键检查
checks = {
    'DEBUG is False': not settings.DEBUG,
    'SECRET_KEY set': bool(settings.SECRET_KEY and len(settings.SECRET_KEY) > 30),
    'ALLOWED_HOSTS set': len(settings.ALLOWED_HOSTS) > 0,
    'HTTPS enabled': getattr(settings, 'SECURE_SSL_REDIRECT', False),
    'HSTS enabled': getattr(settings, 'SECURE_HSTS_SECONDS', 0) > 0,
    'Database configured': settings.DATABASES['default']['ENGINE'] != 'django.db.backends.sqlite3',
}

for check, result in checks.items():
    status = '✓' if result else '✗'
    print(f"{status} {check}")
EOF
```

## 第 10 阶段：日志配置 (Phase 10: Logging Configuration)

```bash
# 测试日志输出
python manage.py shell << EOF
import logging
logger = logging.getLogger('django')
logger.warning('Test warning message')
logger.error('Test error message')
EOF

# 检查日志文件 (如果已配置)
tail -f /var/log/django/django.log
```

## 第 11 阶段：API 文档 (如果使用 DRF) (Phase 11: API Documentation)

```bash
# 生成模式
python manage.py generateschema --format openapi-json > schema.json

# 验证模式
# 检查 schema.json 是否为有效 JSON
python -c "import json; json.load(open('schema.json'))"

# 访问 Swagger UI (如果使用 drf-yasg)
# 在浏览器中访问 http://localhost:8000/swagger/
```

## 第 12 阶段：差异审查 (Phase 12: Diff Review)

```bash
# 显示差异统计
git diff --stat

# 显示实际更改
git diff

# 显示更改的文件
git diff --name-only

# 检查常见问题
git diff | grep -i "todo\|fixme\|hack\|xxx"
git diff | grep "print("  # 调试语句
git diff | grep "DEBUG = True"  # 调试模式
git diff | grep "import pdb"  # 调试器
```

检查清单：
- 无调试语句 (print, pdb, breakpoint())
- 关键代码中无 TODO/FIXME 注释
- 无硬编码的密钥或凭据
- 模型更改包含数据库迁移
- 配置更改已记录
- 外部调用存在错误处理
- 需要的地方有事务管理

## 输出模板 (Output Template)

```
DJANGO VERIFICATION REPORT
==========================

Phase 1: Environment Check
  ✓ Python 3.11.5
  ✓ Virtual environment active
  ✓ All environment variables set

Phase 2: Code Quality
  ✓ mypy: No type errors
  ✗ ruff: 3 issues found (auto-fixed)
  ✓ black: No formatting issues
  ✓ isort: Imports properly sorted
  ✓ manage.py check: No issues

Phase 3: Migrations
  ✓ No unapplied migrations
  ✓ No migration conflicts
  ✓ All models have migrations

Phase 4: Tests + Coverage
  Tests: 247 passed, 0 failed, 5 skipped
  Coverage:
    Overall: 87%
    users: 92%
    products: 89%
    orders: 85%
    payments: 91%

Phase 5: Security Scan
  ✗ pip-audit: 2 vulnerabilities found (fix required)
  ✓ safety check: No issues
  ✓ bandit: No security issues
  ✓ No secrets detected
  ✓ DEBUG = False

Phase 6: Django Commands
  ✓ collectstatic completed
  ✓ Database integrity OK
  ✓ Cache backend reachable

Phase 7: Performance
  ✓ No N+1 queries detected
  ✓ Database indexes configured
  ✓ Query count acceptable

Phase 8: Static Assets
  ✓ npm audit: No vulnerabilities
  ✓ Assets built successfully
  ✓ Static files collected

Phase 9: Configuration
  ✓ DEBUG = False
  ✓ SECRET_KEY configured
  ✓ ALLOWED_HOSTS set
  ✓ HTTPS enabled
  ✓ HSTS enabled
  ✓ Database configured

Phase 10: Logging
  ✓ Logging configured
  ✓ Log files writable

Phase 11: API Documentation
  ✓ Schema generated
  ✓ Swagger UI accessible

Phase 12: Diff Review
  Files changed: 12
  +450, -120 lines
  ✓ No debug statements
  ✓ No hardcoded secrets
  ✓ Migrations included

RECOMMENDATION: ⚠️ Fix pip-audit vulnerabilities before deploying

NEXT STEPS:
1. Update vulnerable dependencies
2. Re-run security scan
3. Deploy to staging for final testing
```

## 部署前检查清单 (Pre-Deployment Checklist)

- [ ] 所有测试通过
- [ ] 覆盖率 ≥ 80%
- [ ] 无安全漏洞
- [ ] 无未应用的迁移
- [ ] 生产设置中 DEBUG = False
- [ ] SECRET_KEY 已正确配置
- [ ] ALLOWED_HOSTS 设置正确
- [ ] 数据库备份已启用
- [ ] 静态文件已收集并提供服务
- [ ] 日志记录已配置并工作
- [ ] 错误监控 (Sentry 等) 已配置
- [ ] CDN 已配置 (如适用)
- [ ] Redis/缓存后端已配置
- [ ] Celery worker 正在运行 (如适用)
- [ ] HTTPS/SSL 已配置
- [ ] 环境变量已记录

## 持续集成 (Continuous Integration)

### GitHub Actions 示例 (GitHub Actions Example)

```yaml
# .github/workflows/django-verification.yml
name: Django Verification

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Cache pip
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install ruff black mypy pytest pytest-django pytest-cov bandit safety pip-audit

      - name: Code quality checks
        run: |
          ruff check .
          black . --check
          isort . --check-only
          mypy .

      - name: Security scan
        run: |
          bandit -r . -f json -o bandit-report.json
          safety check --full-report
          pip-audit

      - name: Run tests
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test
          DJANGO_SECRET_KEY: test-secret-key
        run: |
          pytest --cov=apps --cov-report=xml --cov-report=term-missing

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 快速参考 (Quick Reference)

| 检查 | 命令 |
|-------|---------|
| 环境 | `python --version` |
| 类型检查 | `mypy .` |
| Linting | `ruff check .` |
| 格式化 | `black . --check` |
| 迁移 | `python manage.py makemigrations --check` |
| 测试 | `pytest --cov=apps` |
| 安全 | `pip-audit && bandit -r .` |
| Django 检查 | `python manage.py check --deploy` |
| 收集静态文件 | `python manage.py collectstatic --noinput` |
| 差异统计 | `git diff --stat` |

记住：自动化验证可以捕获常见问题，但不能取代预发布环境中的人工代码审查和测试。
