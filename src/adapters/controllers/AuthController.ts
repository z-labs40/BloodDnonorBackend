import { Request, Response } from "express";
import { AuthUseCases } from "../../application/use-cases/AuthUseCases";
import { Logger } from "../../shared/logger";

export class AuthController {
  private useCases = new AuthUseCases();

  async signup(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const result = await this.useCases.signup(name, email, password);
      Logger.info(`New user registered: ${email}`);
      res.status(201).json({ data: result, message: "Account created successfully." });
    } catch (error: any) {
      Logger.error(`[SIGNUP ERROR] ${error.message}`);
      const status = error.message.includes("already registered") ? 409 : 500;
      res.status(status).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.useCases.login(email, password);
      Logger.info(`User logged in: ${email}`);
      res.json({ data: result, message: "Login successful." });
    } catch (error: any) {
      Logger.error(`[LOGIN ERROR] ${error.message}`);
      res.status(401).json({ error: error.message });
    }
  }

  async adminLogin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.useCases.adminLogin(email, password);
      Logger.info(`Admin logged in: ${email}`);
      res.json({ data: result, message: "Admin login successful." });
    } catch (error: any) {
      Logger.error(`[ADMIN LOGIN ERROR] ${error.message}`);
      if (error.message === "ACCESS_DENIED")
        return res.status(403).json({ error: "Access denied. Not an admin account." });
      res.status(401).json({ error: error.message });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const user = await this.useCases.getMe(req.user!.id);
      res.json({ data: user });
    } catch (error: any) {
      Logger.error(`[GET ME ERROR] ${error.message}`);
      res.status(404).json({ error: error.message });
    }
  }
}
