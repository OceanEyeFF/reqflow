# Plan / Task Queue: WT-20260523-010

## Task Queue

### T1: 配置 Vitest [completed]
- files: `package.json`, `vitest.config.ts`

### T2: 覆盖常量与标签映射完整性 [completed]
- file: `src/types/index.test.ts`
- result: 常量值、标签映射和重复值检查已覆盖

### T3: 覆盖认证辅助逻辑 [completed]
- file: `src/lib/auth-helper.test.ts`
- result: `AuthError` 与 `requireAuth()` 成功/失败路径已覆盖

### T4: 验证测试基线 [completed]
- command: `npm run test`
- result: 2 个测试文件，29 个测试通过

### T5: 验证 build + lint [completed]
- commands: `npm run build`, `npm run lint`
- result: build 通过；lint 经治理后限制在应用源码与可维护配置范围
