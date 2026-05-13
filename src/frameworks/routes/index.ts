import { Express } from "express";
import { body } from "express-validator";
import { AuthController } from "../../adapters/controllers/AuthController";
import { DonorController } from "../../adapters/controllers/DonorController";
import { EmergencyController } from "../../adapters/controllers/EmergencyController";
import { AdminController } from "../../adapters/controllers/AdminController";
import { authMiddleware, adminMiddleware } from "../middleware/auth";
import { validateRequest } from "../middleware/validate";
import { BloodGroup } from "../../shared/enums";

const validBloodGroups = Object.values(BloodGroup);

export default function initRoutes(app: Express): void {
  const auth = new AuthController();
  const donor = new DonorController();
  const emergency = new EmergencyController();
  const admin = new AdminController();
  
  console.log("🛠️ Initializing routes...");


  // ── Root ──────────────────────────────────────────────────────────────────
  app.get("/", (_req, res) => {
    res.json({
      message: "Welcome to BloodConnect API",
      version: "1.0.0",
      status: "active"
    });
  });

  // ── Health ────────────────────────────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });



  // ── Auth ──────────────────────────────────────────────────────────────────
  app.post(
    "/api/auth/signup",
    [
      body("name").trim().notEmpty().withMessage("Name is required."),
      body("email").isEmail().withMessage("A valid email is required."),
      body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    ],
    validateRequest,
    (req: any, res: any) => auth.signup(req, res)
  );

  app.post(
    "/api/auth/login",
    [
      body("email").isEmail().withMessage("A valid email is required."),
      body("password").notEmpty().withMessage("Password is required."),
    ],
    validateRequest,
    (req: any, res: any) => auth.login(req, res)
  );

  app.post(
    "/api/auth/admin/login",
    [
      body("email").isEmail().withMessage("A valid email is required."),
      body("password").notEmpty().withMessage("Password is required."),
    ],
    validateRequest,
    (req: any, res: any) => auth.adminLogin(req, res)
  );

  app.get("/api/auth/me", authMiddleware, (req: any, res: any) => auth.getMe(req, res));

  // ── Donors (Public) ───────────────────────────────────────────────────────
  app.get("/api/donors", (req: any, res: any) => donor.getAll(req, res));

  // ── Donors (Protected) ────────────────────────────────────────────────────
  app.get("/api/donors/:id", authMiddleware, (req: any, res: any) => donor.getById(req, res));

  app.post(
    "/api/donors",
    authMiddleware,
    [
      body("bloodGroup").isIn(validBloodGroups).withMessage(`bloodGroup must be one of: ${validBloodGroups.join(", ")}`),
      body("department").trim().notEmpty().withMessage("Department is required."),
      body("year").trim().notEmpty().withMessage("Year is required."),
      body("phone").trim().notEmpty().isMobilePhone("any").withMessage("A valid phone number is required."),
      body("hostel").trim().notEmpty().withMessage("Hostel is required."),
      body("availability").optional().isBoolean().withMessage("Availability must be a boolean."),
    ],
    validateRequest,
    (req: any, res: any) => donor.create(req, res)
  );

  app.put(
    "/api/donors/:id",
    authMiddleware,
    [
      body("bloodGroup").optional().isIn(validBloodGroups).withMessage(`bloodGroup must be one of: ${validBloodGroups.join(", ")}`),
      body("department").optional().trim().notEmpty().withMessage("Department cannot be empty."),
      body("year").optional().trim().notEmpty().withMessage("Year cannot be empty."),
      body("phone").optional().trim().isMobilePhone("any").withMessage("Phone must be valid."),
      body("hostel").optional().trim().notEmpty().withMessage("Hostel cannot be empty."),
      body("availability").optional().isBoolean().withMessage("Availability must be a boolean."),
    ],
    validateRequest,
    (req: any, res: any) => donor.update(req, res)
  );

  app.delete("/api/donors/:id", authMiddleware, (req: any, res: any) => donor.delete(req, res));

  // ── Emergency (Public) ────────────────────────────────────────────────────
  app.get("/api/emergency", (req: any, res: any) => emergency.getAll(req, res));

  // ── Emergency (Protected) ─────────────────────────────────────────────────
  app.post(
    "/api/emergency",
    authMiddleware,
    [
      body("bloodGroup").isIn(validBloodGroups).withMessage(`bloodGroup must be one of: ${validBloodGroups.join(", ")}`),
      body("message").optional().trim(),
    ],
    validateRequest,
    (req: any, res: any) => emergency.create(req, res)
  );

  // ── Emergency (Admin) ─────────────────────────────────────────────────────
  app.put(
    "/api/emergency/:id/status",
    authMiddleware,
    adminMiddleware,
    [body("status").isIn(["FULFILLED", "CLOSED"]).withMessage("Status must be FULFILLED or CLOSED.")],
    validateRequest,
    (req: any, res: any) => emergency.updateStatus(req, res)
  );

  // ── Admin ─────────────────────────────────────────────────────────────────
  app.get("/api/admin/donors", authMiddleware, adminMiddleware, (req: any, res: any) => admin.getAllDonors(req, res));

  app.put(
    "/api/admin/donors/:id/status",
    authMiddleware,
    adminMiddleware,
    [body("status").isIn(["VERIFIED", "REJECTED"]).withMessage("Status must be VERIFIED or REJECTED.")],
    validateRequest,
    (req: any, res: any) => admin.updateDonorStatus(req, res)
  );

  app.delete("/api/admin/donors/:id", authMiddleware, adminMiddleware, (req: any, res: any) => admin.deleteDonor(req, res));

  app.get("/api/admin/stats", authMiddleware, adminMiddleware, (req: any, res: any) => admin.getStats(req, res));

  app.get("/api/admin/users", authMiddleware, adminMiddleware, (req: any, res: any) => admin.getAllUsers(req, res));
}
