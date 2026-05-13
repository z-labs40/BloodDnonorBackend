import { Request, Response } from "express";
import { AdminUseCases } from "../../application/use-cases/AdminUseCases";
import { Logger } from "../../shared/logger";

export class AdminController {
  private useCases = new AdminUseCases();

  async getAllDonors(req: Request, res: Response) {
    try {
      const status = req.query.status as string | string[] | undefined;
      const donors = await this.useCases.getAllDonors(status);
      res.json({ data: donors });
    } catch (error: any) {
      Logger.error(`[ADMIN GET DONORS ERROR] ${error.message}`);
      res.status(500).json({ error: "Internal server error." });
    }
  }

  async updateDonorStatus(req: Request, res: Response) {
    try {
      const donor = await this.useCases.updateDonorStatus(req.params.id as string, req.body.status);
      Logger.info(`Donor ${req.params.id} status updated to ${req.body.status} by admin ${req.user!.id}`);
      res.json({ data: donor, message: `Donor status updated to ${req.body.status}.` });
    } catch (error: any) {
      Logger.error(`[ADMIN UPDATE DONOR ERROR] ${error.message}`);
      res.status(404).json({ error: error.message });
    }
  }

  async deleteDonor(req: Request, res: Response) {
    try {
      await this.useCases.deleteDonor(req.params.id as string);
      Logger.info(`Donor ${req.params.id} permanently deleted by admin ${req.user!.id}`);
      res.json({ message: "Donor profile permanently deleted." });
    } catch (error: any) {
      Logger.error(`[ADMIN DELETE DONOR ERROR] ${error.message}`);
      res.status(404).json({ error: error.message });
    }
  }

  async getStats(_req: Request, res: Response) {
    try {
      const stats = await this.useCases.getStats();
      res.json({ data: stats });
    } catch (error: any) {
      Logger.error(`[ADMIN STATS ERROR] ${error.message}`);
      res.status(500).json({ error: "Internal server error." });
    }
  }

  async getAllUsers(_req: Request, res: Response) {
    try {
      const users = await this.useCases.getAllUsers();
      res.json({ data: users });
    } catch (error: any) {
      Logger.error(`[ADMIN GET USERS ERROR] ${error.message}`);
      res.status(500).json({ error: "Internal server error." });
    }
  }
}
