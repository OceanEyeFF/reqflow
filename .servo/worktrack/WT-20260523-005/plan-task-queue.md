# Plan / Task Queue: WT-20260523-005

## Metadata

- worktrack_id: WT-20260523-005
- updated: 2026-05-23
- status: ready

## Task Queue

### T1 [P0]: 修复 login/page.tsx signIn 异常处理 [pending]
- 问题: signIn 抛出异常时 loading 状态无法重置，按钮永久禁用
- 修复: 将 signIn 调用包裹在 try/catch 中，在 finally 块中 setLoading(false)

### T2 [P1]: index.ts authorize 添加 Prisma 异常处理 [pending]
- 问题: prisma.user.findUnique 异常未被捕获 → 500 错误
- 修复: 添加 try/catch，异常时返回 null + console.error

### T3 [P1]: me/route.ts 完善错误处理 [pending]
- 问题: 无 try/catch，已删除用户边界未处理
- 修复: 添加 try/catch；session 有效但用户不存在时返回 401 + { error: "user_not_found" }

### T4 [P1]: next-auth.d.ts Session.user 继承 DefaultSession [pending]
- 问题: Session.user 完全重定义，未继承内置字段
- 修复: 使用 extends/intersection 模式继承 DefaultSession["user"]

### T5: 验证 build + lint [pending]
- 运行 npm run build + npm run lint 确认 0 issue

## Dependencies

- T1-T4 互相独立

## Current Blockers

- 无
