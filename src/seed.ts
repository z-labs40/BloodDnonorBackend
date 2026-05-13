import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { AppDataSource } from "./infrastructure/database";
import { User } from "./adapters/models/User";
import { Donor } from "./adapters/models/Donor";
import { EmergencyRequest } from "./adapters/models/EmergencyRequest";
import { BloodGroup, DonorStatus, EmergencyStatus, Role } from "./shared/enums";
import bcrypt from "bcryptjs";

const seed = async () => {
  await AppDataSource.initialize();
  console.log("🌱 Seeding database...");

  const userRepo = AppDataSource.getRepository(User);
  const donorRepo = AppDataSource.getRepository(Donor);
  const emergencyRepo = AppDataSource.getRepository(EmergencyRequest);

  // Clear existing data (order matters due to FK constraints)
  await AppDataSource.query(`DELETE FROM bc_emergency_requests`);
  await AppDataSource.query(`DELETE FROM bc_donors`);
  await AppDataSource.query(`DELETE FROM bc_users`);


  // ── 1. Admin user ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = userRepo.create({
    name: "Admin",
    email: "admin@campus.edu",
    password: adminPassword,
    role: Role.ADMIN,
  });
  await userRepo.save(admin);
  console.log("✅ Admin created: admin@campus.edu / admin123");

  // ── 2. Regular users ───────────────────────────────────────────────────────
  const usersData = [
    { name: "Arjun Sharma", email: "arjun@campus.edu", password: "password123" },
    { name: "Priya Mehta", email: "priya@campus.edu", password: "password123" },
    { name: "Rahul Nair", email: "rahul@campus.edu", password: "password123" },
    { name: "Sneha Patel", email: "sneha@campus.edu", password: "password123" },
    { name: "Kiran Das", email: "kiran@campus.edu", password: "password123" },
  ];

  const users: User[] = [];
  for (const u of usersData) {
    const hashed = await bcrypt.hash(u.password, 10);
    const user = userRepo.create({ name: u.name, email: u.email, password: hashed, role: Role.USER });
    await userRepo.save(user);
    users.push(user);
  }
  console.log(`✅ ${users.length} regular users created`);

  // ── 3. Verified donors ─────────────────────────────────────────────────────
  const donorsData = [
    { user: users[0], bloodGroup: BloodGroup.O_POS, department: "Computer Science", year: "3rd", phone: "+919876543210", hostel: "Block A", availability: true },
    { user: users[1], bloodGroup: BloodGroup.A_NEG, department: "Mechanical Engineering", year: "2nd", phone: "+919876543211", hostel: "Block B", availability: true },
    { user: users[2], bloodGroup: BloodGroup.B_POS, department: "Electronics", year: "4th", phone: "+919876543212", hostel: "Block C", availability: false },
    { user: users[3], bloodGroup: BloodGroup.AB_NEG, department: "Civil Engineering", year: "1st", phone: "+919876543213", hostel: "Block D", availability: true },
    { user: users[4], bloodGroup: BloodGroup.O_NEG, department: "Information Technology", year: "3rd", phone: "+919876543214", hostel: "Block A", availability: true },
  ];

  for (const d of donorsData) {
    const donor = donorRepo.create({
      userId: d.user.id,
      bloodGroup: d.bloodGroup,
      department: d.department,
      year: d.year,
      phone: d.phone,
      hostel: d.hostel,
      availability: d.availability,
      status: DonorStatus.VERIFIED,
    });
    await donorRepo.save(donor);
  }
  console.log("✅ 5 verified donors created");

  // ── 4. Emergency requests ──────────────────────────────────────────────────
  await emergencyRepo.save(emergencyRepo.create({
    requesterId: users[0].id,
    bloodGroup: BloodGroup.O_NEG,
    message: "Urgent: need O- blood for surgery at campus hospital.",
    status: EmergencyStatus.OPEN,
  }));

  await emergencyRepo.save(emergencyRepo.create({
    requesterId: users[1].id,
    bloodGroup: BloodGroup.AB_NEG,
    message: "AB- needed for a student in the medical ward.",
    status: EmergencyStatus.FULFILLED,
  }));
  console.log("✅ 2 emergency requests created");

  console.log("\n🎉 Seeding complete!");
  await AppDataSource.destroy();
};

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
