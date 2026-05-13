import { AppDataSource } from "../../infrastructure/database";
import { Donor } from "../../adapters/models/Donor";
import { User } from "../../adapters/models/User";
import { EmergencyRequest } from "../../adapters/models/EmergencyRequest";
import { In } from "typeorm";
import {
  BloodGroup,
  DonorStatus,
  EmergencyStatus,
  bloodGroupDisplay,
} from "../../shared/enums";

export class AdminUseCases {
  private donorRepo = AppDataSource.getRepository(Donor);
  private userRepo = AppDataSource.getRepository(User);
  private emergencyRepo = AppDataSource.getRepository(EmergencyRequest);

  private formatDonor(donor: Donor) {
    const result: any = { ...donor, bloodGroupDisplay: bloodGroupDisplay[donor.bloodGroup] };
    if (result.user) {
      const { password, ...safeUser } = result.user;
      result.user = safeUser;
    }
    return result;
  }

  async getAllDonors(status?: string | string[]) {
    const where: any = {};

    if (status) {
      // Handle both single value (?status=PENDING) and array (?status=PENDING&status=VERIFIED)
      const statuses = Array.isArray(status) ? status : [status];
      const validStatuses = statuses.filter((s) =>
        Object.values(DonorStatus).includes(s as DonorStatus)
      ) as DonorStatus[];

      if (validStatuses.length === 1) {
        where.status = validStatuses[0];
      } else if (validStatuses.length > 1) {
        where.status = In(validStatuses);
      }
      // if validStatuses is empty, no filter applied → return all
    }

    const donors = await this.donorRepo.find({
      where,
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
    return donors.map((d) => this.formatDonor(d));
  }

  async updateDonorStatus(donorId: string, status: "VERIFIED" | "REJECTED") {
    const donor = await this.donorRepo.findOne({ where: { id: donorId } });
    if (!donor) throw new Error("Donor not found.");
    donor.status = status as DonorStatus;
    await this.donorRepo.save(donor);
    return this.formatDonor(donor);
  }

  async deleteDonor(donorId: string) {
    const donor = await this.donorRepo.findOne({ where: { id: donorId } });
    if (!donor) throw new Error("Donor not found.");
    await this.donorRepo.remove(donor);
  }

  async getStats() {
    const [totalDonors, verifiedDonors, pendingDonors, availableDonors, openEmergencies] =
      await Promise.all([
        this.donorRepo.count(),
        this.donorRepo.count({ where: { status: DonorStatus.VERIFIED } }),
        this.donorRepo.count({ where: { status: DonorStatus.PENDING } }),
        this.donorRepo.count({ where: { status: DonorStatus.VERIFIED, availability: true } }),
        this.emergencyRepo.count({ where: { status: EmergencyStatus.OPEN } }),
      ]);

    const groupedRaw = await this.donorRepo
      .createQueryBuilder("donor")
      .select("donor.bloodGroup", "bloodGroup")
      .addSelect("COUNT(*)", "count")
      .where("donor.status = :status", { status: DonorStatus.VERIFIED })
      .groupBy("donor.bloodGroup")
      .getRawMany();

    const donorsByBloodGroup: Record<string, number> = {};
    for (const row of groupedRaw) {
      const key = bloodGroupDisplay[row.bloodGroup as BloodGroup] || row.bloodGroup;
      donorsByBloodGroup[key] = parseInt(row.count, 10);
    }

    return { totalDonors, verifiedDonors, pendingDonors, availableDonors, openEmergencies, donorsByBloodGroup };
  }

  async getAllUsers() {
    const users = await this.userRepo.find({ order: { createdAt: "DESC" } });
    return users.map(({ password, ...u }) => u);
  }
}
