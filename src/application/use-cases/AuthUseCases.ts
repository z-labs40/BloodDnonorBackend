import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { AppDataSource } from "../../infrastructure/database";
import { User } from "../../adapters/models/User";
import { Role } from "../../shared/enums";
import { config } from "../../config";

export class AuthUseCases {
  private repository = AppDataSource.getRepository(User);

  private generateToken(user: User): string {
    const options: SignOptions = { expiresIn: config.jwt.expiresIn as any };
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      options
    );
  }

  private safeUser(user: User) {
    return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  }

  async signup(name: string, email: string, password: string) {
    const existing = await this.repository.findOne({ where: { email } });
    if (existing) throw new Error("Email is already registered.");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.repository.create({ name, email, password: hashedPassword, role: Role.USER });
    await this.repository.save(user);

    return { token: this.generateToken(user), user: this.safeUser(user) };
  }

  async login(email: string, password: string) {
    const user = await this.repository.findOne({ where: { email } });
    if (!user) throw new Error("Invalid email or password.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password.");

    return { token: this.generateToken(user), user: this.safeUser(user) };
  }

  async adminLogin(email: string, password: string) {
    const user = await this.repository.findOne({ where: { email } });
    if (!user) throw new Error("Invalid email or password.");

    if (user.role !== Role.ADMIN) throw new Error("ACCESS_DENIED");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password.");

    return { token: this.generateToken(user), user: this.safeUser(user) };
  }

  async getMe(userId: string) {
    const user = await this.repository.findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found.");
    return this.safeUser(user);
  }
}
