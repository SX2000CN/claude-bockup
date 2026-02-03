# 📂 路径映射与手动安装指南 (Manual Installation Guide)

本项目 (`claude-bockup`) 是一个纯粹的 Claude Code 配置集合。
请按照以下映射关系，将文件夹内容复制到您本地的 Claude 配置目录中。

## 核心配置映射表

| 📁 项目文件夹 | ➡️ 目标路径 (macOS/Linux) | ➡️ 目标路径 (Windows) | 📝 作用 |
| :--- | :--- | :--- | :--- |
| `agents/` | `~/.claude/agents/` | `%USERPROFILE%\.claude\agents\` | **子代理**：专门处理特定任务的 AI 角色 |
| `rules/` | `~/.claude/rules/` | `%USERPROFILE%\.claude\rules\` | **规则**：必须遵守的硬性准则 (安全/风格) |
| `skills/` | `~/.claude/skills/` | `%USERPROFILE%\.claude\skills\` | **技能**：定义好的工作流和领域知识 |
| `commands/` | `~/.claude/commands/` | `%USERPROFILE%\.claude\commands\` | **指令**：自定义斜杠命令 (如 `/plan`) |
| `contexts/` | `~/.claude/contexts/` | `%USERPROFILE%\.claude\contexts\` | **模式**：CLI 启动时注入的系统提示词 |

---

## 🛠️ 高级配置 (需要修改配置文件)

### 1. 钩子 (Hooks) 与 脚本 (Scripts)

**不要复制 `scripts/` 文件夹**，建议保留在本地仓库中，然后在 `settings.json` 中引用绝对路径。

1.  打开您的 Claude 全局设置：
    *   Mac/Linux: `~/.claude/settings.json`
    *   Windows: `%USERPROFILE%\.claude\settings.json`

2.  参考本项目 `hooks/hooks.json` 的内容，将 `hooks` 字段添加到您的设置中。
3.  **关键步骤**：修改所有 `command` 路径，指向您下载本仓库的实际位置。

    *   **示例 (修改前)**: `"command": "node scripts/hooks/session-start.js"`
    *   **示例 (修改后)**: `"command": "node /Users/yourname/tools/claude-bockup/scripts/hooks/session-start.js"`

### 2. MCP 工具 (Model Context Protocol)

1.  打开 MCP 配置文件：
    *   Mac/Linux: `~/.claude.json` (注意不是 .claude 文件夹)
    *   Windows: `%USERPROFILE%\.claude.json` (或 `%APPDATA%\Claude\claude_config.json`)

2.  参考本项目 `mcp-configs/mcp-servers.json`，将需要的 MCP 服务器配置复制进去。
3.  **注意**：记得将 `YOUR_API_KEY_HERE` 替换为真实的密钥。

---

## 💡 验证安装

安装完成后，重启 Claude Code，输入 `/` 应该能看到 `/plan`, `/verify` 等新指令。
输入 `/doctor` (Claude 自带) 可以检查配置是否生效。
