import { Request, Response } from "express";
import { DonorUseCases } from "../../application/use-cases/DonorUseCases";
import { Logger } from "../../shared/logger";

export class DonorController {
  private useCases = new DonorUseCases();

  async getAll(req: Request, res: Response) {
    try {
      const { bloodGroup, department, hostel, year, availability } = req.query as Record<string, string>;
      const donors = await this.useCases.getAll({ bloodGroup, department, hostel, year, availability });
      res.json({ data: donors });
    } catch (error: any) {
      Logger.error(`[GET DONORS ERROR] ${error.message}`);
      res.status(500).json({ error: "Internal server error." });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const donor = await this.useCases.getById(req.params.id as string, true);
      res.json({ data: donor });
    } catch (error: any) {
      Logger.error(`[GET DONOR ERROR] ${error.message}`);
      res.status(404).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const donor = await this.useCases.create(req.user!.id, req.body);
      Logger.info(`Donor profile created for user: ${req.user!.id}`);
      res.status(201).json({ data: donor, message: "Donor profile created. Awaiting admin verification." });
    } catch (error: any) {
      Logger.error(`[CREATE DONOR ERROR] ${error.message}`);
      if (error.message.includes("already have"))
        return res.status(409).json({ error: "You already have a donor profile." });
      if (error.message.includes("foreign key") || error.message.includes("violates"))
        return res.status(401).json({ error: "Invalid session. Please log in again and retry." });
      res.status(500).json({ error: "Internal server error." });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const donor = await this.useCases.update(req.params.id as string, req.user!.id, req.body);
      res.json({ data: donor, message: "Donor profile updated." });
    } catch (error: any) {
      Logger.error(`[UPDATE DONOR ERROR] ${error.message}`);
      if (error.message === "FORBIDDEN")
        return res.status(403).json({ error: "You can only update your own donor profile." });
      res.status(404).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await this.useCases.delete(req.params.id as string, req.user!.id);
      res.json({ message: "Donor profile deleted successfully." });
    } catch (error: any) {
      Logger.error(`[DELETE DONOR ERROR] ${error.message}`);
      if (error.message === "FORBIDDEN")
        return res.status(403).json({ error: "You can only delete your own donor profile." });
      res.status(404).json({ error: error.message });
    }
  }
}
