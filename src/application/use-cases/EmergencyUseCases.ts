import { AppDataSource } from "../../infrastructure/database";
import { EmergencyRequest } from "../../adapters/models/EmergencyRequest";
import { BloodGroup, EmergencyStatus, bloodGroupDisplay } from "../../shared/enums";

export class EmergencyUseCases {
  private repository = AppDataSource.getRepository(EmergencyRequest);

  private format(r: EmergencyRequest) {
    const result: any = { ...r, bloodGroupDisplay: bloodGroupDisplay[r.bloodGroup] };
    if (result.requester) {
      const { password, ...safeUser } = result.requester;
      result.requester = safeUser;
    }
    return result;
  }

  async getAll() {
    const requests = await this.repository.find({
      order: { createdAt: "DESC" },
      relations: ["requester"],
    });
    return requests.map((r) => this.format(r));
  }

  async create(requesterId: string, bloodGroup: BloodGroup, message?: string) {
    const request = this.repository.create({
      requesterId,
      bloodGroup,
      message: message ?? null,
      status: EmergencyStatus.OPEN,
    });
    await this.repository.save(request);
    return this.format(request);
  }

  async updateStatus(id: string, status: "FULFILLED" | "CLOSED") {
    const request = await this.repository.findOne({ where: { id } });
    if (!request) throw new Error("Emergency request not found.");
    request.status = status as EmergencyStatus;
    await this.repository.save(request);
    return this.format(request);
  }
}
