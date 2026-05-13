import { Request, Response } from "express";
import { EmergencyUseCases } from "../../application/use-cases/EmergencyUseCases";
import { BloodGroup } from "../../shared/enums";
import { Logger } from "../../shared/logger";

export class EmergencyController {
  private useCases = new EmergencyUseCases();

  async getAll(_req: Request, res: Response) {
    try {
      const requests = await this.useCases.getAll();
      res.json({ data: requests });
    } catch (error: any) {
      Logger.error(`[GET EMERGENCY ERROR] ${error.message}`);
      res.status(500).json({ error: "Internal server error." });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { bloodGroup, message } = req.body;
      const request = await this.useCases.create(req.user!.id, bloodGroup as BloodGroup, message);
      Logger.info(`Emergency request created by user: ${req.user!.id}`);
      res.status(201).json({ data: request, message: "Emergency request created." });
    } catch (error: any) {
      Logger.error(`[CREATE EMERGENCY ERROR] ${error.message}`);
      res.status(500).json({ error: "Internal server error." });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const request = await this.useCases.updateStatus(req.params.id as string, status);
      res.json({ data: request, message: "Emergency request status updated." });
    } catch (error: any) {
      Logger.error(`[UPDATE EMERGENCY ERROR] ${error.message}`);
      res.status(404).json({ error: error.message });
    }
  }
}
