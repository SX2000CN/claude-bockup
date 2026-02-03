# 性能优化 (Performance Optimization)

## 模型选择策略 (Model Selection Strategy)

**Haiku 4.5** (90% 的 Sonnet 能力, 3 倍成本节约):
- 频繁调用的轻量级 Agent
- 结对编程和代码生成
- 多 Agent 系统中的工作 Agent

**Sonnet 4.5** (最佳编码模型):
- 主要开发工作
- 编排多 Agent 工作流
- 复杂的编码任务

**Opus 4.5** (最深层推理):
- 复杂的架构决策
- 最大的推理需求
- 研究和分析任务

## 上下文窗口管理 (Context Window Management)

避免在上下文窗口的最后 20% 进行：
- 大规模重构
- 跨多个文件的功能实现
- 调试复杂的交互

低上下文敏感度的任务：
- 单文件编辑
- 独立的工具函数创建
- 文档更新
- 简单的 Bug 修复

## 深度思考 (Ultrathink) + 计划模式 (Plan Mode)

对于需要深度推理的复杂任务：
1. 使用 `ultrathink` 增强思考
2. 启用 **计划模式 (Plan Mode)** 以获得结构化方法
3. 通过多轮批评来"预热引擎"
4. 使用分角色的子 Agent 进行多样化分析

## 构建故障排除 (Build Troubleshooting)

如果构建失败：
1. 使用 **build-error-resolver** agent
2. 分析错误消息
3. 增量修复
4. 每次修复后验证
