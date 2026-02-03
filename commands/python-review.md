---
description: 全面的 Python 代码审查，检查 PEP 8 合规性、类型提示、安全性和 Pythonic 习惯用法。调用 python-reviewer agent。
---

# Python 代码审查 (Python Code Review)

此命令调用 **python-reviewer** agent 进行全面的 Python 特定代码审查。

## 此命令做什么 (What This Command Does)

1. **识别 Python 更改**：通过 `git diff` 查找修改过的 `.py` 文件
2. **运行静态分析**：执行 `ruff`, `mypy`, `pylint`, `black --check`
3. **安全扫描**：检查 SQL 注入、命令注入、不安全的反序列化
4. **类型安全审查**：分析类型提示和 mypy 错误
5. **Pythonic 代码检查**：验证代码是否遵循 PEP 8 和 Python 最佳实践
6. **生成报告**：按严重程度对问题进行分类

## 何时使用 (When to Use)

在以下情况使用 `/python-review`：
- 编写或修改 Python 代码后
- 提交 Python 更改前
- 审查包含 Python 代码的 Pull Request 时
- 接手新的 Python 代码库时
- 学习 Pythonic 模式和习惯用法时

## 审查类别 (Review Categories)

### 严重 (CRITICAL - 必须修复)
- SQL/命令注入漏洞
- 不安全的 eval/exec 使用
- Pickle 不安全反序列化
- 硬编码凭据
- YAML 不安全加载
- 隐藏错误的裸 except 子句

### 高 (HIGH - 应该修复)
- 公共函数缺少类型提示
- 可变的默认参数
- 悄悄吞掉异常
- 未对资源使用上下文管理器
- 使用 C 风格循环而不是推导式
- 使用 type() 而不是 isinstance()
- 无锁的竞态条件

### 中 (MEDIUM - 考虑修复)
- PEP 8 格式违规
- 公共函数缺少 docstrings
- 使用 print 语句而不是 logging
- 低效的字符串操作
- 无命名常量的魔术数字
- 未使用 f-strings 进行格式化
- 不必要的列表创建

## 运行的自动检查 (Automated Checks Run)

```bash
# 类型检查
mypy .

# Linting 和格式化
ruff check .
black --check .
isort --check-only .

# 安全扫描
bandit -r .

# 依赖审计
pip-audit
safety check

# 测试
pytest --cov=app --cov-report=term-missing
```

## 示例用法 (Example Usage)

```text
User: /python-review

Agent:
# Python 代码审查报告 (Python Code Review Report)

## 审查的文件
- app/routes/user.py (modified)
- app/services/auth.py (modified)

## 静态分析结果
✓ ruff: 无问题
✓ mypy: 无错误
⚠️ black: 2 个文件需要重新格式化
✓ bandit: 无安全问题

## 发现的问题

[CRITICAL] SQL 注入漏洞
文件: app/routes/user.py:42
问题: 用户输入直接拼接到 SQL 查询中
```python
query = f"SELECT * FROM users WHERE id = {user_id}"  # Bad
```
修复: 使用参数化查询
```python
query = "SELECT * FROM users WHERE id = %s"  # Good
cursor.execute(query, (user_id,))
```

[HIGH] 可变默认参数
文件: app/services/auth.py:18
问题: 可变默认参数导致共享状态
```python
def process_items(items=[]):  # Bad
    items.append("new")
    return items
```
修复: 使用 None 作为默认值
```python
def process_items(items=None):  # Good
    if items is None:
        items = []
    items.append("new")
    return items
```

[MEDIUM] 缺少类型提示
文件: app/services/auth.py:25
问题: 公共函数无类型注解
```python
def get_user(user_id):  # Bad
    return db.find(user_id)
```
修复: 添加类型提示
```python
def get_user(user_id: str) -> Optional[User]:  # Good
    return db.find(user_id)
```

[MEDIUM] 未使用上下文管理器
文件: app/routes/user.py:55
问题: 发生异常时文件未关闭
```python
f = open("config.json")  # Bad
data = f.read()
f.close()
```
修复: 使用上下文管理器
```python
with open("config.json") as f:  # Good
    data = f.read()
```

## 摘要
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 2

建议: ❌ 在修复 CRITICAL 问题前阻止合并

## 需要格式化
运行: `black app/routes/user.py app/services/auth.py`
```

## 批准标准 (Approval Criteria)

| 状态 | 条件 |
|--------|-----------|
| ✅ 批准 (Approve) | 无 CRITICAL 或 HIGH 问题 |
| ⚠️ 警告 (Warning) | 仅有 MEDIUM 问题 (谨慎合并) |
| ❌ 拒绝 (Block) | 发现 CRITICAL 或 HIGH 问题 |

## 与其他命令集成 (Integration)

- 先使用 `/python-test` 确保测试通过
- 对于非 Python 特定的关注点，使用 `/code-review`
- 在提交前使用 `/python-review`
- 如果静态分析工具失败，使用 `/build-fix`

## 框架特定审查 (Framework-Specific Reviews)

### Django 项目
审查员检查：
- N+1 查询问题 (使用 `select_related` 和 `prefetch_related`)
- 模型更改缺少迁移
- ORM 可用时使用原生 SQL
- 多步操作缺少 `transaction.atomic()`

### FastAPI 项目
审查员检查：
- CORS 配置错误
- 请求验证的 Pydantic 模型
- 响应模型正确性
- 正确的 async/await 使用
- 依赖注入模式

### Flask 项目
审查员检查：
- 上下文管理 (应用上下文, 请求上下文)
- 正确的错误处理
- 蓝图 (Blueprint) 组织
- 配置管理

## 相关资源

- Agent: `agents/python-reviewer.md`
- Skills: `skills/python-patterns/`, `skills/python-testing/`

## 常见修复 (Common Fixes)

### 添加类型提示
```python
# Before
def calculate(x, y):
    return x + y

# After
from typing import Union

def calculate(x: Union[int, float], y: Union[int, float]) -> Union[int, float]:
    return x + y
```

### 使用上下文管理器
```python
# Before
f = open("file.txt")
data = f.read()
f.close()

# After
with open("file.txt") as f:
    data = f.read()
```

### 使用列表推导式
```python
# Before
result = []
for item in items:
    if item.active:
        result.append(item.name)

# After
result = [item.name for item in items if item.active]
```

### 修复可变默认值
```python
# Before
def append(value, items=[]):
    items.append(value)
    return items

# After
def append(value, items=None):
    if items is None:
        items = []
    items.append(value)
    return items
```

### 使用 f-strings (Python 3.6+)
```python
# Before
name = "Alice"
greeting = "Hello, " + name + "!"
greeting2 = "Hello, {}".format(name)

# After
greeting = f"Hello, {name}!"
```

### 修复循环中的字符串拼接
```python
# Before
result = ""
for item in items:
    result += str(item)

# After
result = "".join(str(item) for item in items)
```

## Python 版本兼容性

审查员会提示使用了较新 Python 版本的特性：

| 特性 | 最低 Python 版本 |
|---------|----------------|
| 类型提示 | 3.5+ |
| f-strings | 3.6+ |
| 海象运算符 (`:=`) | 3.8+ |
| 仅位置参数 | 3.8+ |
| 匹配语句 (Match statements) | 3.10+ |
| 类型联合 (`x \| None`) | 3.10+ |

确保您的项目 `pyproject.toml` 或 `setup.py` 指定了正确的最低 Python 版本。
