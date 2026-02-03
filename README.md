# Claude Bockup (Manual Install Edition)

> **注意**：这是 `claude-bockup` 的纯净配置分支。
> 去除了所有插件打包逻辑，只保留最核心的配置文件的**源代码**，适合希望完全掌控配置的高级用户。

![License](https://img.shields.io/badge/license-MIT-blue.svg)

本仓库汇集了经过 10+ 个月实战打磨的 Claude Code 配置集合，包含 Agent、Skill、Hook、Rule 等全套生态。

## 📚 核心文档

*   **[👉 手动安装指南 (PATH_MAPPING.md)](./PATH_MAPPING.md)**
    *   **必读**：详细列出了每个文件夹应该复制到你电脑的哪个位置。
    *   包含核心配置和高级配置 (Hooks/MCP) 的设置方法。

*   **[✨ 功能详细介绍 (FEATURES.md)](./FEATURES.md)**
    *   解释了每个 Agent、Skill、Rule 具体是做什么的。
    *   包含所有可用指令 (`/plan`, `/verify` 等) 的说明。

## 📂 目录结构

```text
claude-bockup/
├── agents/       # 🤖 子代理 (复制到 ~/.claude/agents/)
├── rules/        # 🛡️ 规则准则 (复制到 ~/.claude/rules/)
├── skills/       # 🧠 技能知识库 (复制到 ~/.claude/skills/)
├── commands/     # ⚡ 斜杠指令 (复制到 ~/.claude/commands/)
├── contexts/     # 🎭 上下文模式 (复制到 ~/.claude/contexts/)
├── hooks/        # 🔌 钩子配置 (参考 hooks.json 修改 settings.json)
├── scripts/      # 📜 自动化脚本 (保留在本地，被 Hooks 引用)
└── mcp-configs/  # 🛠️ MCP 工具配置 (参考 mcp-servers.json)
```

## 🚀 快速开始

1.  **Clone 本仓库** 到本地一个固定目录：
    ```bash
    git clone -b claude-backup https://github.com/SX2000CN/claude-bockup.git ~/tools/claude-bockup
    ```
2.  按照 **[PATH_MAPPING.md](./PATH_MAPPING.md)** 的指引，将各目录下的 `.md` 文件复制到你的 Claude 配置目录。
3.  (进阶) 修改你的 `settings.json` 以启用 Hooks 和 Scripts。

---

**Star this repo if it helps. Build something great.**
