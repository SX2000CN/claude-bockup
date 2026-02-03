#!/usr/bin/env node
/**
 * Stop Hook (Session End) - Persist learnings when session ends
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs when Claude session ends. Creates/updates session log file
 * with timestamp for continuity tracking.
 */

const path = require('path');
const fs = require('fs');
const {
  getSessionsDir,
  getDateString,
  getTimeString,
  getSessionIdShort,
  ensureDir,
  writeFile,
  replaceInFile,
  log
} = require('../lib/utils');

async function main() {
  const sessionsDir = getSessionsDir();
  const today = getDateString();
  const shortId = getSessionIdShort();
  // Include session ID in filename for unique per-session tracking
  const sessionFile = path.join(sessionsDir, `${today}-${shortId}-session.tmp`);

  ensureDir(sessionsDir);

  const currentTime = getTimeString();

  // If session file exists for today, update the end time
  if (fs.existsSync(sessionFile)) {
    const success = replaceInFile(
      sessionFile,
      /\*\*Last Updated:\*\*.*/,
      `**Last Updated:** ${currentTime}`
    );

    if (success) {
      log(`[会话结束] 已更新会话文件: ${sessionFile}`);
    }
  } else {
    // Create new session file with template
    const template = `# 会话: ${today}
**日期:** ${today}
**开始时间:** ${currentTime}
**最后更新:** ${currentTime}

---

## 当前状态

[此处填写会话上下文]

### 已完成
- [ ]

### 进行中
- [ ]

### 下次会话备注
-

### 需要加载的上下文
\`\`\`
[相关文件]
\`\`\`
`;

    writeFile(sessionFile, template);
    log(`[会话结束] 已创建会话文件: ${sessionFile}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[会话结束] 错误:', err.message);
  process.exit(0);
});
