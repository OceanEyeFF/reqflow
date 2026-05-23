# Plan / Task Queue: WT-20260523-003

## Metadata

- worktrack_id: WT-20260523-003
- updated: 2026-05-23
- status: ready

## Task Queue

### T1: 修复 unused imports (6 warnings) [pending]
涉及文件: layout.tsx (Card, CardContent, CardDescription, CardHeader, CardTitle, Badge), tickets/[id]/page.tsx (Input, Clock), tickets/new/page.tsx (CardHeader, CardTitle), badge.tsx (VariantProps)
操作: 删除未使用的 import

### T2: 修复 no-html-link-for-pages (2 errors) [pending]
涉及文件: layout.tsx (2处 <a> 标签)
操作: 将 `<a href="/">` 和 `<a href="/tickets/">` 替换为 `<Link href="...">`

### T3: 修复 React hooks 模式问题 (3 errors + 1 warning) [pending]
涉及文件:
- page.tsx (dashboard): fetchData 在 useEffect 之前声明
- tickets/[id]/page.tsx: setState in effect (react-hooks/set-state-in-effect)
- tickets/new/page.tsx: fetchUsers 声明顺序
- tickets/page.tsx: missing dependency 'fetchTickets'
操作: 调整函数声明顺序，修复依赖数组，restructure effect

### T4: 修复 no-explicit-any (14 errors) [pending]
涉及文件: tickets/[id]/route.ts (2处), tickets/route.ts (1处), users/route.ts (1处), auth/index.ts (8处), members/route.ts (隐式 any)
操作: 替换为具体类型或 unknown，必要时定义 interface

### T5: 修复 prefer-const + unused vars (3 issues) [pending]
涉及文件: tickets/route.ts (let→const), stats/route.ts (unused request), members/route.ts (unused getTicketWithMember)
操作: let→const 替换，删除未使用的函数参数和导入

### T6: 验证 tsconfig.json strict 模式 [pending]
操作: 读取 tsconfig.json，检查 strict 是否启用；若未启用，记录当前状态

### T7: 最终验证 [pending]
操作: 运行 `npm run lint` 确认 0 error 0 warning

## Dependencies

- T1-T5 可独立并行执行（不同文件无依赖）

## Current Blockers

- 无
