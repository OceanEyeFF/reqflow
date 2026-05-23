# Plan / Task Queue: WT-20260523-006

## Metadata

- worktrack_id: WT-20260523-006
- updated: 2026-05-23
- status: ready

## Task Queue

### T1 [P0]: 创建 requireAuth 辅助函数 [pending]
- 新建 src/lib/auth-helper.ts
- 提取重复 16 次的 auth 检查模式
- 导出 requireAuth(): Promise<Session> 函数
- 在 3 个目标文件中替换内联 auth 检查

### T2 [P0]: tickets/route.ts 修复 [pending]
- 添加 try/catch 到 GET 和 POST handler
- 修复 GET scope 枚举绕过 bug (invalid scope → assigned_to_me 默认)
- POST 添加基本输入验证 (title 非空, priority/type 有效值检查)
- 统一错误格式: { error: string }
- POST 验证 assigneeId 用户存在性 (可选: 用 prisma.user.findUnique)

### T3 [P0]: tickets/[id]/route.ts 修复 [pending]
- 添加 try/catch 到 GET/PATCH/DELETE 三个 handler
- DELETE 先 findUnique 检查存在性再 delete
- PATCH updateData 类型改进
- PATCH status/priority 值验证
- 统一错误格式

### T4 [P1]: tickets/stats/route.ts 修复 [pending]
- 添加 try/catch
- whereClause 类型改进
- 统一错误格式

### T5: 验证 build + lint [pending]

## Dependencies

- T1 完成后 T2-T4 可并行

## Current Blockers

- 无
