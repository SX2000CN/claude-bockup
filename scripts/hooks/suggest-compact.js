#!/usr/bin/env node
/**
 * Strategic Compact Suggester
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs on PreToolUse or periodically to suggest manual compaction at logical intervals
 *
 * Why manual over auto-compact:
 * - Auto-compact happens at arbitrary points, often mid-task
 * - Strategic compacting preserves context through logical phases
 * - Compact after exploration, before execution
 * - Compact after completing a milestone, before starting next
 */

const path = require('path');
const {
  getTempDir,
  readFile,
  writeFile,
  log
} = require('../lib/utils');

async function main() {
  // Track tool call count (increment in a temp file)
  // Use a session-specific counter file based on PID from parent process
  // or session ID from environment
  const sessionId = process.env.CLAUDE_SESSION_ID || process.ppid || 'default';
  const counterFile = path.join(getTempDir(), `claude-tool-count-${sessionId}`);
  const threshold = parseInt(process.env.COMPACT_THRESHOLD || '50', 10);

  let count = 1;

  // Read existing count or start at 1
  const existing = readFile(counterFile);
  if (existing) {
    count = parseInt(existing.trim(), 10) + 1;
  }

  // Save updated count
  writeFile(counterFile, String(count));

  // Suggest compact after threshold tool calls
  if (count === threshold) {
    log(`[策略性压缩] 已达到 ${threshold} 次工具调用 - 如果正在转换阶段，请考虑使用 /compact`);
  }

  // Suggest at regular intervals after threshold
  if (count > threshold && count % 25 === 0) {
    log(`[策略性压缩] ${count} 次工具调用 - 如果上下文已过时，这是使用 /compact 的好时机`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[策略性压缩] 错误:', err.message);
  process.exit(0);
});
