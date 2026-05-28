import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "harveysloansllc@outlook.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Cashflow345!";
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminHash, role: "ADMIN" },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      firstName: "Harvey",
      lastName: "Admin",
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Seed interest schedule
  const schedules = [
    { weekNumber: 1, ratePercent: 8, label: "1st Week Missed" },
    { weekNumber: 2, ratePercent: 15, label: "2nd Week Missed" },
    { weekNumber: 3, ratePercent: 25, label: "3rd Week Missed" },
    { weekNumber: 4, ratePercent: 30, label: "4th Week Missed" },
  ];

  for (const s of schedules) {
    await prisma.interestSchedule.upsert({
      where: { weekNumber: s.weekNumber },
      update: { ratePercent: s.ratePercent, label: s.label },
      create: s,
    });
  }
  console.log("✅ Interest schedules seeded (8%, 15%, 25%, 30%)");

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
