<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:worktree-discipline -->
## Git Worktree 工作流

**所有代码改动必须在 worktree 里完成，禁止直接修改 main checkout。**

1. 创建 worktree：不要在 `develop` 直接开分支
2. 完成开发后合并回 `develop`
3. 清理 worktree：合并完成后删除 worktree 目录

参考 plan 文件中的 `--workdir` 或 `git worktree` 命令。
<!-- END:worktree-discipline -->
