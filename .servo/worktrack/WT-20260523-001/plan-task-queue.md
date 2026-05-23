# Plan / Task Queue: WT-20260523-001

## Metadata

- worktrack_id: WT-20260523-001
- updated: 2026-05-23
- status: ready

## Task Queue

### T1: 编写 README.md 新内容 [pending]

- 文件: README.md
- 内容要求:
  1. 项目名称: ReqFlow - 轻量级内部工单需求协作系统
  2. 功能概述: 工单管理、协作者管理、附件上传、通知系统
  3. 技术栈表格: Next.js 16, React 19, TypeScript 5, TailwindCSS 4, Prisma 5, SQLite, NextAuth v5, Radix UI, Lucide Icons
  4. 快速启动: git clone → npm install → npx prisma migrate dev → npm run db:seed → npm run dev
  5. 测试账号表格: admin/admin123 (管理员), manager/manager123 (项目经理), user/user123 (普通用户)
  6. 项目结构概览 (简化版目录树)
  7. 可用脚本: dev, build, lint, db:seed, db:studio
- 验收: README.md 内容完整、信息准确

### T2: 验证 README.md 在 worktree 中可被正确渲染 [pending]

- 检查 Markdown 语法正确性
- 确认路径/命令可执行
- 验收: 无明显错误

## Dependencies

- 无外部依赖

## Current Blockers

- 无
