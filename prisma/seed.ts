import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      displayName: "管理员",
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: "admin",
      department: "技术部",
    },
  });
  console.log(`✅ Created user: ${admin.username}`);

  // Create manager
  const managerPassword = await bcrypt.hash("manager123", 12);
  const manager = await prisma.user.upsert({
    where: { username: "manager" },
    update: {},
    create: {
      username: "manager",
      displayName: "项目经理",
      email: "manager@example.com",
      passwordHash: managerPassword,
      role: "manager",
      department: "产品部",
    },
  });
  console.log(`✅ Created user: ${manager.username}`);

  // Create regular user
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { username: "user" },
    update: {},
    create: {
      username: "user",
      displayName: "张三",
      email: "user@example.com",
      passwordHash: userPassword,
      role: "user",
      department: "研发部",
    },
  });
  console.log(`✅ Created user: ${user.username}`);

  // Create a sample ticket
  const ticket = await prisma.ticket.create({
    data: {
      title: "【示例】用户登录页面样式优化",
      description: "当前登录页面在移动端显示效果不佳，需要适配响应式布局，并调整配色方案。",
      type: "需求",
      priority: "high",
      status: "pending",
      creatorId: admin.id,
      assigneeId: manager.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Add ticket log
  await prisma.ticketLog.create({
    data: {
      ticketId: ticket.id,
      userId: admin.id,
      action: "created",
      newValue: "待处理",
    },
  });
  console.log(`✅ Created sample ticket: ${ticket.title}`);

  // Add a comment
  await prisma.ticketComment.create({
    data: {
      ticketId: ticket.id,
      userId: manager.id,
      content: "收到，已加入排期，预计下周完成。",
    },
  });
  console.log("✅ Created sample comment");

  console.log("\n📋 Login credentials:");
  console.log("  admin/admin123 (管理员)");
  console.log("  manager/manager123 (项目经理)");
  console.log("  user/user123 (普通用户)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });