# 项目汉化报告 (Project Localization Report)

## 概览 (Overview)

本项目 `everything-claude-code` 已成功从英文迁移至简体中文 (Simplified Chinese / zh-CN)。本次汉化采用"原地替换 (In-Place Translation)"策略，直接修改了现有的文件内容，以确保与 Claude Code 插件系统的最大兼容性。

## 汉化范围 (Scope)

### 1. 核心文档 (Documentation)
- **README.md**: 完整翻译，包括特性介绍、安装指南和使用说明。
- **CONTRIBUTING.md**: 贡献指南已本地化。
- **Guides**:
  - `the-shortform-guide.md`: 全方位速查指南已翻译。
  - `the-longform-guide.md`: 详细深度指南已翻译。

### 2. 智能体 (Agents)
位于 `agents/` 目录下的所有 Agent 定义文件 (`.md`) 已翻译。
- **翻译内容**: `description` (描述), `instructions` (指令), `system prompts` (系统提示词)。
- **保留内容**: Frontmatter 中的 `name`, `tools`, `model` 字段（保持英文以确保功能正常）。
- **主要 Agent**: `planner`, `architect`, `code-reviewer`, `tdd-guide` 等。

### 3. 技能与工作流 (Skills)
位于 `skills/` 目录下的所有技能定义已翻译。
- 包括 `coding-standards`, `tdd-workflow`, `security-review`, `verification-loop` 等。
- 解释性文本、步骤说明和最佳实践均已汉化。

### 4. 命令 (Commands)
位于 `commands/` 目录下的 Slash 命令文档已翻译。
- 用户手册、适用场景和示例用法已本地化。
- 命令名称 (如 `/plan`, `/verify`) 保持不变。

### 5. 钩子与脚本 (Hooks & Scripts)
- **Hooks (`hooks/hooks.json`)**: 钩子描述 (`description`) 和内嵌的 Shell 命令反馈信息已翻译。
- **CLI Scripts (`scripts/`)**:
  - `setup-package-manager.js`: 交互式提示和帮助信息已汉化。
  - `skill-create-output.js`: 分析报告输出已汉化。
  - `lib/*.js`: 工具库中的日志输出已汉化。
  - `hooks/*.js`: 会话生命周期钩子的日志输出已汉化。
  - `ci/*.js`: 验证脚本的错误和状态信息已汉化。

### 6. 配置 (Configuration)
- **package.json**: 项目描述已汉化。
- **.claude-plugin/plugin.json**: 插件元数据描述已汉化。
- **mcp-configs/mcp-servers.json**: MCP 服务器描述已汉化。

## 验证 (Verification)
已对关键组件进行静态检查和人工抽查：
- ✅ `scripts/ci/` 中的验证脚本已更新并能正确输出中文日志。
- ✅ 核心 Agent (`planner`, `architect`) 的提示词已确认为中文。
- ✅ 核心命令 (`/plan`, `/tdd`) 的文档已确认为中文。
- ✅ 插件入口 `plugin.json` 格式正确且描述已更新。

## 维护说明 (Maintenance)
- **新增内容**: 未来添加新的 Agent 或 Skill 时，请直接使用中文编写描述和指令。
- **保留字段**: 在编辑 Markdown Frontmatter 或 JSON 配置时，请务必保持键名 (Key) 为英文（如 `matcher`, `tools`, `env`），仅翻译值 (Value)。
