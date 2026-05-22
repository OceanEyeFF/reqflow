import { expect, test } from "@playwright/test";

test("authenticated user can reach core ticket workflow", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "登录 ReqFlow" })).toBeVisible();

  await page.getByLabel("用户名").fill("admin");
  await page.getByLabel("密码").fill("admin123");
  await page.getByRole("button", { name: "登录" }).click();

  await expect(page.getByRole("heading", { name: "工作台" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "待我处理 (0)" })).toBeVisible();
  await expect(page.getByText("暂无工单")).toBeVisible();
  await page.screenshot({ path: "test-results/smoke/01-dashboard.png", fullPage: true });

  await page.getByRole("button", { name: "我发起的" }).click();
  await expect(page.getByRole("heading", { name: "我发起的 (1)" })).toBeVisible();
  await expect(page.getByRole("link", { name: /用户登录页面样式优化/ })).toBeVisible();

  await page.getByRole("link", { name: /用户登录页面样式优化/ }).click();
  await expect(page.getByRole("heading", { name: "【示例】用户登录页面样式优化" })).toBeVisible();
  await expect(page.getByText("评论 (1)")).toBeVisible();
  await page.screenshot({ path: "test-results/smoke/02-ticket-detail.png", fullPage: true });

  await page.getByRole("link", { name: "工单" }).click();
  await expect(page.locator("h2", { hasText: "工单列表" })).toBeVisible();
  await page.getByRole("button", { name: "全部工单" }).click();
  await expect(page.getByRole("link", { name: /用户登录页面样式优化/ })).toBeVisible();
  await page.screenshot({ path: "test-results/smoke/03-ticket-list.png", fullPage: true });

  await page.getByRole("link", { name: "新建工单" }).first().click();
  await expect(page.getByRole("heading", { name: "新建工单" })).toBeVisible();
  await expect(page.getByLabel("标题 *")).toBeVisible();
  await expect(page.getByLabel("优先级")).toHaveValue("medium");
  await expect(page.getByLabel("优先级").locator("option:checked")).toHaveText("中");
  await page.screenshot({ path: "test-results/smoke/04-new-ticket.png", fullPage: true });

  await page.getByRole("button", { name: "退出" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "登录 ReqFlow" })).toBeVisible();
});
