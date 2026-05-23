# Plan / Task Queue: WT-20260523-009

## Task Queue

### T1 [P0]: 修复 tickets/[id] 优先级下拉选 Bug [pending]
- 文件: tickets/[id]/page.tsx ~307行
- Bug: Object.keys(TICKET_PRIORITY) 返回 ["LOW","MEDIUM","HIGH","URGENT"]
  但 PRIORITY_LABELS 的 key 是小写值 ("low","medium"...)
  结果: 标签渲染 undefined, value 发送大写键给 API
- 修复: 改用 Object.entries(TICKET_PRIORITY) 映射 [key,value]→选项

### T2 [P0]: 修复 tickets/page 关键词搜索 [pending]
- Bug: keyword 每次击键触发 useEffect 重取 + handleSearch 再触发一次 (双重获取)
- 修复: 移除 useEffect 中的 keyword 依赖；仅 handleSearch 触发获取
- 添加防抖 (300ms debounce)

### T3 [P1]: 提取共享 Ticket 类型 [pending]
- page.tsx 和 tickets/page.tsx 中重复的 Ticket type
- 提取到 src/types/index.ts (或 src/types/ticket.ts)
- 两处引用替换为 import

### T4 [P1]: 关键 fetch 调用添加错误处理 [pending]
- tickets/[id]/page.tsx: 状态/负责人/优先级/成员变更后显示 toast/alert
- tickets/page.tsx: 列表获取失败时显示错误
- dashboard/page.tsx: 数据获取失败时显示错误

### T5 [P1]: 替换根 page.tsx [pending]
- 当前: Next.js 默认模板 (Vercel 链接等)
- 改为: 重定向到 /login 或 /dashboard

### T6 [P2]: 添加 aria 属性 [pending]
- 导航链接添加 aria-current
- 搜索按钮添加 aria-label
- 统计卡片添加 role="button" tabIndex onKeyDown

### T7: 验证 build + lint [pending]
