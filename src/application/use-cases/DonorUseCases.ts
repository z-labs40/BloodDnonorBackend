import { AppDataSource } from "../../infrastructure/database";
import { Donor } from "../../adapters/models/Donor";
import { BloodGroup, DonorStatus, bloodGroupDisplay } from "../../shared/enums";

export class DonorUseCases {
  private repository = AppDataSource.getRepository(Donor);

  private format(donor: Donor, includePhone: boolean) {
    const result: any = {
      ...donor,
      bloodGroupDisplay: bloodGroupDisplay[donor.bloodGroup],
    };
    if (!includePhone) delete result.phone;
    // Strip password from joined user
    if (result.user) {
      const { password, ...safeUser } = result.user;
      result.user = safeUser;
    }
    return result;
  }

  async getAll(filters: {
    bloodGroup?: string;
    department?: string;
    hostel?: string;
    year?: string;
    availability?: string;
  }) {
    const query = this.repository
      .createQueryBuilder("donor")
      .leftJoinAndSelect("donor.user", "user")
      .where("donor.status = :status", { status: DonorStatus.VERIFIED });

    if (filters.bloodGroup)
      query.andWhere("donor.bloodGroup = :bloodGroup", { bloodGroup: filters.bloodGroup });
    if (filters.department)
      query.andWhere("donor.department ILIKE :dept", { dept: `%${filters.department}%` });
    if (filters.hostel)
      query.andWhere("donor.hostel ILIKE :hostel", { hostel: `%${filters.hostel}%` });
    if (filters.year)
      query.andWhere("donor.year = :year", { year: filters.year });
    if (filters.availability !== undefined)
      query.andWhere("donor.availability = :avail", { avail: filters.availability === "true" });

    const donors = await query.getMany();
    return donors.map((d) => this.format(d, false));
  }

  async getById(id: string, includePhone: boolean) {
    const donor = await this.repository.findOne({
      where: { id, status: DonorStatus.VERIFIED },
      relations: ["user"],
    });
    if (!donor) throw new Error("Donor not found or not verified.");
    return this.format(donor, includePhone);
  }

  async create(userId: string, data: {
    bloodGroup: BloodGroup;
    department: string;
    year: string;
    phone: string;
    hostel: string;
    availability?: boolean;
  }) {
    const existing = await this.repository.findOne({ where: { userId } });
    if (existing) throw new Error("You already have a donor profile.");

    const donor = this.repository.create({
      userId,
      ...data,
      availability: data.availability ?? true,
      status: DonorStatus.PENDING,
    });
    await this.repository.save(donor);
    return this.format(donor, true);
  }

  async update(donorId: string, userId: string, data: Partial<{
    bloodGroup: BloodGroup;
    department: string;
    year: string;
    phone: string;
    hostel: string;
    availability: boolean;
  }>) {
    const donor = await this.repository.findOne({ where: { id: donorId } });
    if (!donor) throw new Error("Donor profile not found.");
    if (donor.userId !== userId) throw new Error("FORBIDDEN");

    Object.assign(donor, data);
    await this.repository.save(donor);
    return this.format(donor, true);
  }

  async delete(donorId: string, userId: string) {
    const donor = await this.repository.findOne({ where: { id: donorId } });
    if (!donor) throw new Error("Donor profile not found.");
    if (donor.userId !== userId) throw new Error("FORBIDDEN");
    await this.repository.remove(donor);
  }
}
