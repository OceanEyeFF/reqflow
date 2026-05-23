import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

test("authenticated user can reach core ticket workflow", async ({ page, browser }) => {
  process.env.DATABASE_URL ??= "file:./dev.db";
  const prisma = new PrismaClient();
  const testStartedAt = new Date();

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
  const sampleTicketLink = page.getByRole("link", { name: /用户登录页面样式优化/ });
  await expect(sampleTicketLink).toBeVisible();
  const ticketHref = await sampleTicketLink.getAttribute("href");
  const ticketId = ticketHref?.split("/").filter(Boolean).pop();
  expect(ticketId).toBeTruthy();

  const regularUser = await prisma.user.findUnique({
    where: { username: "user" },
    select: { id: true },
  });
  expect(regularUser).toBeTruthy();

  const nonMemberContext = await browser.newContext();
  const nonMemberPage = await nonMemberContext.newPage();
  await nonMemberPage.goto("/login");
  await nonMemberPage.getByLabel("用户名").fill("user");
  await nonMemberPage.getByLabel("密码").fill("user123");
  await nonMemberPage.getByRole("button", { name: "登录" }).click();
  await expect(nonMemberPage.getByRole("heading", { name: "工作台" })).toBeVisible();
  const nonMemberTicket = await nonMemberPage.request.get(`/api/tickets/${ticketId}`);
  expect(nonMemberTicket.status()).toBe(403);
  const nonMemberComments = await nonMemberPage.request.get(`/api/tickets/${ticketId}/comments`);
  expect(nonMemberComments.status()).toBe(403);
  const nonMemberMembers = await nonMemberPage.request.get(`/api/tickets/${ticketId}/members`);
  expect(nonMemberMembers.status()).toBe(403);
  await nonMemberContext.close();

  await sampleTicketLink.click();
  await expect(page.getByRole("heading", { name: "【示例】用户登录页面样式优化" })).toBeVisible();
  await expect(page.getByText("评论 (1)")).toBeVisible();
  await expect(page.getByText("附件 (0)")).toBeVisible();
  await page.screenshot({ path: "test-results/smoke/02-ticket-detail.png", fullPage: true });

  const invalidStatusPatch = await page.request.patch(`/api/tickets/${ticketId}`, {
    data: { status: "invalid_status" },
  });
  expect(invalidStatusPatch.status()).toBe(400);
  const invalidPriorityPatch = await page.request.patch(`/api/tickets/${ticketId}`, {
    data: { priority: "invalid_priority" },
  });
  expect(invalidPriorityPatch.status()).toBe(400);
  const invalidAssigneePatch = await page.request.patch(`/api/tickets/${ticketId}`, {
    data: { assigneeId: "missing-user-id" },
  });
  expect(invalidAssigneePatch.status()).toBe(404);
  const emptyAssigneePatch = await page.request.patch(`/api/tickets/${ticketId}`, {
    data: { assigneeId: "" },
  });
  expect(emptyAssigneePatch.status()).toBe(400);

  const attachmentName = "wt007-smoke-attachment.txt";
  await page.getByLabel("选择附件").setInputFiles({
    name: attachmentName,
    mimeType: "text/plain",
    buffer: Buffer.from("WT-007 attachment smoke test"),
  });
  await page.getByRole("button", { name: "上传附件" }).click();
  await expect(page.getByText("附件 (1)")).toBeVisible();
  const attachmentLink = page.getByRole("link", { name: `下载 ${attachmentName}` });
  await expect(attachmentLink).toBeVisible();
  await expect(attachmentLink).toHaveAttribute("href", /\/api\/tickets\/.+\/attachments\/.+\/download/);
  const downloadHref = await attachmentLink.getAttribute("href");
  expect(downloadHref).toBeTruthy();
  const downloadRes = await page.request.get(downloadHref!);
  expect(downloadRes.status()).toBe(200);
  await page.screenshot({ path: "test-results/smoke/03-ticket-detail-attachments.png", fullPage: true });

  await page.getByRole("button", { name: `删除 ${attachmentName}` }).click();
  await expect(page.getByText("附件 (0)")).toBeVisible();
  await expect(page.getByText("暂无附件")).toBeVisible();

  await page.getByRole("button", { name: "添加协作者" }).click();
  await page.getByLabel("选择协作者", { exact: true }).selectOption({ label: "张三" });
  await page.getByLabel("选择协作者角色").selectOption({ label: "关注者" });
  await page.getByRole("button", { name: "确认添加" }).click();
  await expect(page.getByLabel("修改协作者角色 张三")).toHaveValue("watcher");

  await page.getByLabel("修改协作者角色 张三").selectOption({ label: "协作者" });
  await expect(page.getByLabel("修改协作者角色 张三")).toHaveValue("collaborator");

  await page.getByLabel("添加评论").fill("WT-009 smoke 管理员评论");
  await page.getByRole("button", { name: "发送评论" }).click();
  await expect(page.getByText("评论 (2)")).toBeVisible();
  await expect(page.getByText("WT-009 smoke 管理员评论")).toBeVisible();
  await page.screenshot({ path: "test-results/smoke/04-member-comment-hardening.png", fullPage: true });

  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();
  await memberPage.goto("/login");
  await memberPage.getByLabel("用户名").fill("user");
  await memberPage.getByLabel("密码").fill("user123");
  await memberPage.getByRole("button", { name: "登录" }).click();
  await expect(memberPage.getByRole("heading", { name: "工作台" })).toBeVisible();
  await expect(memberPage.getByRole("button", { name: /通知，2 条未读/ })).toBeVisible();
  await memberPage.getByRole("button", { name: /通知，2 条未读/ }).click();
  const memberNotificationDialog = memberPage.getByRole("dialog", { name: "通知列表" });
  await expect(memberNotificationDialog.getByText("您被添加为协作者")).toBeVisible();
  await expect(memberNotificationDialog.getByText("工单收到新评论")).toBeVisible();
  await memberNotificationDialog
    .getByRole("link", { name: "【示例】用户登录页面样式优化" })
    .first()
    .click();
  await expect(memberPage).toHaveURL(new RegExp(`/tickets/${ticketId}$`));
  await expect(memberPage.locator("h1", { hasText: "【示例】用户登录页面样式优化" })).toBeVisible();
  await expect(memberPage.getByRole("button", { name: "处理中" })).toBeDisabled();
  const memberStatusPatch = await memberPage.request.patch(`/api/tickets/${ticketId}`, {
    data: { status: "processing" },
  });
  expect(memberStatusPatch.status()).toBe(403);
  await memberPage.getByLabel("添加评论").fill("WT-009 smoke 成员评论");
  await memberPage.getByRole("button", { name: "发送评论" }).click();
  await expect(memberPage.getByText("评论 (3)")).toBeVisible();
  await expect(memberPage.getByText("WT-009 smoke 成员评论")).toBeVisible();
  await memberPage.screenshot({ path: "test-results/smoke/05-member-comment-visible.png", fullPage: true });
  await memberContext.close();

  await prisma.ticketComment.deleteMany({
    where: {
      ticketId: ticketId!,
      content: { in: ["WT-009 smoke 管理员评论", "WT-009 smoke 成员评论"] },
    },
  });
  await prisma.ticketMember.deleteMany({
    where: { ticketId: ticketId!, userId: regularUser!.id },
  });
  await prisma.notification.deleteMany({
    where: { ticketId: ticketId!, createdAt: { gte: testStartedAt } },
  });

  await page.getByRole("link", { name: "工单" }).click();
  await expect(page.locator("h2", { hasText: "工单列表" })).toBeVisible();
  await page.getByRole("button", { name: "全部工单" }).click();
  await expect(page.getByRole("link", { name: /用户登录页面样式优化/ })).toBeVisible();
  await page.screenshot({ path: "test-results/smoke/06-ticket-list.png", fullPage: true });

  await page.getByRole("link", { name: "新建工单" }).first().click();
  await expect(page.getByRole("heading", { name: "新建工单" })).toBeVisible();
  await expect(page.getByLabel("标题 *")).toBeVisible();
  await expect(page.getByLabel("优先级")).toHaveValue("medium");
  await expect(page.getByLabel("优先级").locator("option:checked")).toHaveText("中");
  await page.screenshot({ path: "test-results/smoke/07-new-ticket.png", fullPage: true });

  await page.getByLabel("标题 *").fill("ReqFlow smoke 通知验证");
  await page.getByLabel("负责人").selectOption({ label: "项目经理 (@manager)" });
  await page.getByLabel("需求描述").fill("验证通知列表、已读和跳转。");
  await page.getByRole("button", { name: "创建工单" }).click();
  await expect(page.getByRole("heading", { name: "ReqFlow smoke 通知验证" })).toBeVisible();
  const notificationTicketId = new URL(page.url()).pathname.split("/").filter(Boolean).pop();
  expect(notificationTicketId).toBeTruthy();

  const statusRes = await page.request.patch(`/api/tickets/${notificationTicketId}`, {
    data: { status: "processing" },
  });
  expect(statusRes.ok()).toBeTruthy();

  await page.getByRole("button", { name: "退出" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "登录 ReqFlow" })).toBeVisible();

  const anonymousAttachments = await page.request.get(`/api/tickets/${ticketId}/attachments`);
  expect(anonymousAttachments.status()).toBe(401);

  const managerContext = await browser.newContext();
  const managerPage = await managerContext.newPage();
  await managerPage.goto("/login");
  await expect(managerPage.getByRole("heading", { name: "登录 ReqFlow" })).toBeVisible();
  await managerPage.getByLabel("用户名").fill("manager");
  await managerPage.getByLabel("密码").fill("manager123");
  await managerPage.getByRole("button", { name: "登录" }).click();
  await expect(managerPage.getByRole("heading", { name: "工作台" })).toBeVisible();

  await expect(managerPage.getByRole("button", { name: /通知，2 条未读/ })).toBeVisible();
  await managerPage.getByRole("button", { name: /通知，2 条未读/ }).click();
  const notificationDialog = managerPage.getByRole("dialog", { name: "通知列表" });
  await expect(notificationDialog).toBeVisible();
  await expect(notificationDialog.getByText("您被分配了工单")).toBeVisible();
  await expect(notificationDialog.getByRole("link", { name: "ReqFlow smoke 通知验证" }).first()).toBeVisible();
  await managerPage.screenshot({ path: "test-results/smoke/08-notifications-unread.png", fullPage: true });

  await managerPage.getByRole("button", { name: "标记已读 ReqFlow smoke 通知验证" }).first().click();
  await expect(managerPage.getByRole("button", { name: /通知，1 条未读/ })).toBeVisible();

  await managerPage.getByRole("button", { name: /通知，1 条未读/ }).click();
  await expect(notificationDialog).toBeHidden();
  await managerPage.getByRole("button", { name: /通知，1 条未读/ }).click();
  await notificationDialog.getByRole("button", { name: "全部已读" }).click();
  await expect(managerPage.getByRole("button", { name: /通知，无未读/ })).toBeVisible();

  await managerPage.getByRole("button", { name: /通知，无未读/ }).click();
  await expect(notificationDialog).toBeHidden();
  await managerPage.getByRole("button", { name: /通知，无未读/ }).click();
  await managerPage
    .getByRole("dialog", { name: "通知列表" })
    .getByRole("link", { name: "ReqFlow smoke 通知验证" })
    .first()
    .click();
  await expect(managerPage).toHaveURL(new RegExp(`/tickets/${notificationTicketId}$`));
  await expect(managerPage.locator("h1", { hasText: "ReqFlow smoke 通知验证" })).toBeVisible();
  await managerPage.screenshot({ path: "test-results/smoke/09-notification-ticket-link.png", fullPage: true });

  const smokeTicket = await prisma.ticket.findFirst({
    where: { title: "ReqFlow smoke 通知验证" },
    select: { id: true },
  });
  if (smokeTicket) {
    await prisma.notification.deleteMany({ where: { ticketId: smokeTicket.id } });
    await prisma.ticket.delete({ where: { id: smokeTicket.id } });
  }
  await prisma.$disconnect();

  await managerContext.close();
});
